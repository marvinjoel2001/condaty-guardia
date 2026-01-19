// components/VersionChecker.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import Modal from 'react-native-modal';
import VersionCheck from 'react-native-version-check';
import useApi from '../hooks/useApi';
import { cssVar } from '../styles/themes';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===================================================================
// CONFIGURACIÓN
// ===================================================================
const CACHE_DURATION_MS = __DEV__ ? 1 * 1000 : 10 * 60 * 1000; // 10 seg dev | 1min prod
const STORAGE_KEY_LAST_CHECK = '@version_check_last_time';

interface GuardVersion {
  min_version?: Record<'ios' | 'android', string>;
  update_url?: Record<'ios' | 'android', string>;
}

interface VersionApiResponse {
  guard: GuardVersion;
}

const images = {
  ios: require('../../src/images/condy-app-store.png'),
  android: require('../../src/images/condy-play-store.png'),
} as const;

const VersionChecker = ({ children }: { children: React.ReactNode }) => {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateUrl, setUpdateUrl] = useState<string>('');

  const { data, error, reload } = useApi('/app-version', 'GET', {}, 0, true);
  const versionData = data as VersionApiResponse | null;

  const appStateRef = useRef(AppState.currentState);

  const checkForUpdate = useCallback(async (apiData: VersionApiResponse | null) => {
    try {
      const currentVersion = VersionCheck.getCurrentVersion();
      const platform = Platform.OS as 'ios' | 'android';

      let minVersion = apiData?.guard?.min_version?.[platform];
      if (!minVersion) {
        minVersion = await VersionCheck.getLatestVersion();
        if (!minVersion) return;
      }

      const updateNeeded = await VersionCheck.needUpdate({
        currentVersion,
        latestVersion: minVersion,
      });

      if (updateNeeded.isNeeded) {
        const url = apiData?.guard?.update_url?.[platform] ?? (await VersionCheck.getStoreUrl());
        setUpdateUrl(url);
        setNeedsUpdate(true);
      } else {
        setNeedsUpdate(false);
      }
    } catch (err) {
      if (__DEV__) console.error('[VersionChecker] Error verificando update:', err);
      setNeedsUpdate(false);
    }
  }, []);

  // Función que decide si debemos recargar o usar cache
  const tryRefreshVersionCheck = useCallback(async () => {
    try {
      const lastCheckStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK);
      const now = Date.now();

      if (lastCheckStr) {
        const lastCheck = parseInt(lastCheckStr, 10);
        if (now - lastCheck < CACHE_DURATION_MS) {
          // Cache aún válido → usamos lo que ya tenemos
          if (versionData) checkForUpdate(versionData);
          return;
        }
      }

      // Cache expirado o no existe → pedimos al backend
      await reload();

      // Si reload fue exitoso, versionData se actualizará y guardaremos timestamp en el effect de abajo
    } catch (e) {
      if (__DEV__) console.error('Error en version check refresh:', e);
      await reload(); // En caso de error de storage, forzamos petición
    }
  }, [reload, versionData, checkForUpdate]);

  // Primera carga
  useEffect(() => {
    tryRefreshVersionCheck();
  }, []); // Solo una vez al montar

  // Cuando llegan datos nuevos → verificamos y guardamos timestamp
  useEffect(() => {
    if (versionData) {
      checkForUpdate(versionData);
      AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK, Date.now().toString());
    }
  }, [versionData, checkForUpdate]);

  // Fallback si hay error y no tenemos data
  useEffect(() => {
    if (error && !versionData) {
      checkForUpdate(null);
    }
  }, [error, versionData, checkForUpdate]);

  // === LO MÁS IMPORTANTE: revisamos cada vez que la app vuelve a primer plano ===
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        tryRefreshVersionCheck();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [tryRefreshVersionCheck]);

  const openStore = useCallback(() => {
    if (updateUrl) Linking.openURL(updateUrl).catch(() => {});
  }, [updateUrl]);

  if (!needsUpdate) return <>{children}</>;

  const screenWidth = Dimensions.get('window').width;
  const selectedImage = Platform.OS === 'android' ? images.android : images.ios;

  return (
    <>
      {children}
      <Modal
        isVisible={true}
        backdropOpacity={0.9}
        animationIn="fadeIn"
        animationOut="fadeOut"
        useNativeDriverForBackdrop
        supportedOrientations={['portrait', 'landscape']}>
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
          <Image source={selectedImage} style={{ width: '100%', height: 277 }} resizeMode="cover" />
          <View style={{ padding: 16, alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: cssVar.sXxl, fontWeight: 'bold', marginBottom: 10, color: cssVar.cWhite }}>
              Actualización Requerida ✨
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 12, color: cssVar.cWhiteV1, fontSize: cssVar.sM }}>
              Tenemos una nueva actualización para mejorar tu experiencia, hazlo ahora para seguir usando la app.
            </Text>
            <TouchableOpacity
              onPress={openStore}
              activeOpacity={0.85}
              style={{
                backgroundColor: cssVar.cAccent,
                width: '100%',
                paddingVertical: 12,
                borderRadius: cssVar.bRadius,
              }}>
              <Text style={{ color: cssVar.cPrimary, fontWeight: '600', fontSize: cssVar.spL, textAlign: 'center' }}>
                Actualizar Ahora
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default VersionChecker;