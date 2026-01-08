import React, { useEffect, useState } from 'react';
import { View, Text, Linking, Platform, TouchableOpacity, Image, Dimensions } from 'react-native';
import VersionCheck from 'react-native-version-check';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../hooks/useApi';
import { cssVar } from '../styles/themes';

// Storage keys
const VERSION_CHECK_KEY = '@version_check_last_time';
const VERSION_DATA_KEY = '@version_data';

// Duración de cache: 10 minutos para testing (sube a 60 * 60 * 1000 en prod)
const CACHE_DURATION_MS = 30 * 60 * 1000;

// Interface for cached data (partial para manejar incompletos)
interface CachedVersionData {
  guard: {
    min_version: Partial<Record<'ios' | 'android', string>>;
    update_url: Partial<Record<'ios' | 'android', string>>;
  };
  last_check: string; // ISO string
}

const VersionChecker = ({ children }: { children: React.ReactNode }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [versionData, setVersionData] = useState<any>(null);

  const { data, error: apiError, execute, reload } = useApi('/app-version', 'GET', {}, 0, shouldFetch);

  const images = {
    ios: require('../../src/images/condy-app-store.png'),
    android: require('../../src/images/condy-play-store.png'),
  } as const;
  const selectedImage = Platform.OS === 'android' ? images.android : images.ios;

  // Helper: Verifica si fetch necesario
  const shouldCheckVersion = async (): Promise<boolean> => {
    try {
      const lastCheckTime = await AsyncStorage.getItem(VERSION_CHECK_KEY);
      if (!lastCheckTime) return true;

      const lastCheckDate = new Date(lastCheckTime);
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - lastCheckDate.getTime();
      if (__DEV__) console.log('Cache time difference:', timeDifference, 'vs', CACHE_DURATION_MS);
      return timeDifference >= CACHE_DURATION_MS;
    } catch (error) {
      if (__DEV__) console.error('Error checking cache time:', error);
      return true;
    }
  };

  // Helper: Carga cache (valida si válida)
  const loadCachedData = async (): Promise<CachedVersionData | null> => {
    try {
      const stored = await AsyncStorage.getItem(VERSION_DATA_KEY);
      if (stored) {
        if (__DEV__) console.log('Loaded cache:', stored);
        const parsed = JSON.parse(stored) as CachedVersionData;
        // Invalida si guard vacío
        if (!parsed.guard?.min_version || Object.keys(parsed.guard.min_version).length === 0) {
          if (__DEV__) console.warn('Invalid cache: empty min_version, clearing');
          await AsyncStorage.removeItem(VERSION_DATA_KEY);
          return null;
        }
        return parsed;
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading cache:', error);
    }
    return null;
  };

  // Helper: Guarda solo si data válida (no vacía)
  const saveVersionData = async (dataToSave: any) => {
    try {
      if (!dataToSave?.guard?.min_version || Object.keys(dataToSave.guard.min_version).length === 0) {
        if (__DEV__) console.warn('Skipping save: empty/invalid guard data from API');
        return; // No guarda bad data
      }
      const currentTime = new Date().toISOString();
      await AsyncStorage.setItem(VERSION_CHECK_KEY, currentTime);

      const cached: CachedVersionData = {
        guard: dataToSave.guard,
        last_check: currentTime,
      };
      await AsyncStorage.setItem(VERSION_DATA_KEY, JSON.stringify(cached));
      if (__DEV__) console.log('Saved cache:', cached);
    } catch (error) {
      if (__DEV__) console.error('Error saving cache:', error);
    }
  };

  // Core validation (fallback a store si min undefined)
  const checkForUpdate = async (checkData: any) => {
    try {
      const currentVersion = VersionCheck.getCurrentVersion();
      const platform = Platform.OS;
      let minVersion = checkData?.guard?.min_version?.[platform];

      if (__DEV__) {
        console.log('Full versionData:', JSON.stringify(checkData));
        console.log('Current version:', currentVersion, 'Min version:', minVersion);
      }

      if (!minVersion) {
        if (__DEV__) console.warn('No min_version from API, falling back to store latest');
        // Fallback: Chequea contra latest en store (async, no bloquea)
        minVersion = await VersionCheck.getLatestVersion();
        if (!minVersion) {
          if (__DEV__) console.log('No store latest available, skipping');
          return; // No net/store? Skip para no bloquear
        }
      }

      const needsUpdate = await VersionCheck.needUpdate({
        currentVersion,
        latestVersion: minVersion,
      });

      if (__DEV__) console.log('Needs update:', needsUpdate.isNeeded);

      if (needsUpdate.isNeeded) {
        const storeUrl = checkData?.guard?.update_url?.[platform] || (await VersionCheck.getStoreUrl());
        setUpdateUrl(storeUrl);
        if (__DEV__) console.log('Update URL:', storeUrl);
        setShowUpdateModal(true);
      }
    } catch (error) {
      if (__DEV__) console.error('Error checking version:', error);
    }
  };

  // Init on mount
  useEffect(() => {
    const initializeVersionCheck = async () => {
      const shouldCheck = await shouldCheckVersion();

      if (shouldCheck) {
        setShouldFetch(true);
      } else {
        const cached = await loadCachedData();
        if (cached) {
          setVersionData({ guard: cached.guard });
        } else {
          setShouldFetch(true);
        }
      }
    };

    initializeVersionCheck();
  }, []);

  // Handle data/error
  useEffect(() => {
    if (apiError) {
      if (__DEV__) console.error('API error:', apiError);
      loadCachedData().then(cached => {
        if (cached) setVersionData({ guard: cached.guard });
      });
      return;
    }

    if (!data) return;

    saveVersionData(data);
    setVersionData(data);
  }, [data, apiError]);

  // Validate
  useEffect(() => {
    if (!versionData) return;
    checkForUpdate(versionData);
  }, [versionData]);

  if (showUpdateModal) {
    const screenWidth = Dimensions.get('window').width;
    return (
      <Modal
        isVisible={true}
        backdropOpacity={0.9}
        animationIn="fadeIn"
        animationOut="fadeOut">
        <View
          style={{
            backgroundColor: cssVar.cPrimary,
            borderRadius: 12,
            alignItems: 'center',
            width: Math.min(400, screenWidth * 0.9),
            alignSelf: 'center',
            borderColor: cssVar.cNeutral700,
            borderWidth: 2,
            overflow: 'hidden',
          }}>
          <Image
            source={selectedImage}
            style={{ width: '100%', height: 277 }}
            resizeMode="cover"
          />
          <View
            style={{
              padding: 16,
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={{
                fontSize: cssVar.sXxl,
                fontWeight: 'bold',
                marginBottom: 10,
                color: cssVar.cWhite,
              }}>
              Actualización Requerida ✨
            </Text>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 12,
                color: cssVar.cWhiteV1,
                fontSize: cssVar.sM,
              }}>
              Tenemos una nueva actualización para mejorar tu experiencia, hazlo ahora para seguir usando la app.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(updateUrl)}
              activeOpacity={0.85}
              style={{
                backgroundColor: cssVar.cAccent,
                margin: 0,
                width: '100%',
                paddingVertical: 12,
                borderRadius: cssVar.bRadius,
              }}>
              <Text
                style={{
                  color: cssVar.cPrimary,
                  fontWeight: '600',
                  fontSize: cssVar.spL,
                  textAlign: 'center',
                }}>
                Actualizar Ahora
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return children;
};

export default VersionChecker;