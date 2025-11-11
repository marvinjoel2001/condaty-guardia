import React, {useEffect, useState} from 'react';
import {View, Text, Linking, Platform, TouchableOpacity, Image} from 'react-native';
import VersionCheck from 'react-native-version-check';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../hooks/useApi';
import { cssVar } from '../styles/themes';

const VERSION_CHECK_KEY = '@version_check_last_time';
const ONE_HOUR_IN_MS = 60 * 60 * 1000; // 1 hora en milisegundos

const VersionChecker = ({children}: {children: React.ReactNode}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const {data} = useApi('/app-version', 'GET', {}, 0, shouldFetch);
  
  const images = {
    ios: require('../../src/images/condy-app-store.png'),
    android: require('../../src/images/condy-play-store.png'),
  } as const;
  const selectedImage = Platform.OS === 'android' ? images.android : images.ios;

  // Función para verificar si ha pasado más de 1 hora desde la última consulta
  const shouldCheckVersion = async () => {
    try {
      const lastCheckTime = await AsyncStorage.getItem(VERSION_CHECK_KEY);
      
      if (!lastCheckTime) {
        // Primera vez, hacer la consulta
        return true;
      }
      
      const lastCheckDate = new Date(lastCheckTime);
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - lastCheckDate.getTime();
      
      // Si ha pasado más de 1 hora
      if (timeDifference >= ONE_HOUR_IN_MS) {
        return true;
      }
      
      // console.log(`Version check skipped. Last check: ${lastCheckDate.toLocaleString()}. Next check in: ${Math.ceil((ONE_HOUR_IN_MS - timeDifference) / 60000)} minutes`);
      return false;
    } catch (error) {
      // console.log('Error checking last version check time:', error);
      return true; // En caso de error, hacer la consulta
    }
  };

  // Función para guardar la hora de la última consulta
  const saveLastCheckTime = async () => {
    try {
      const currentTime = new Date().toISOString();
      await AsyncStorage.setItem(VERSION_CHECK_KEY, currentTime);
      // console.log(`Version check time saved: ${currentTime}`);
    } catch (error) {
      // console.log('Error saving version check time:', error);
    }
  };
  
  const checkForUpdate = async () => {
    try {
      const currentVersion = VersionCheck.getCurrentVersion();
      const platform = Platform.OS;
      const minVersion = data.guard?.min_version?.[platform];

      if (!minVersion) return;
      const needsUpdate = VersionCheck.needUpdate({
        currentVersion,
        latestVersion: minVersion,
      });
      // console.log('needsUpdate', currentVersion, minVersion);
      if ((await needsUpdate)?.isNeeded) {
        setUpdateUrl(
          data.guard?.update_url?.[platform] ||
            (await VersionCheck.getStoreUrl()),
        );
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.log('Error checking version:', error);
    }
  };

  useEffect(() => {
    const initializeVersionCheck = async () => {
      // Verificar si debe hacer la consulta al backend
      const shouldCheck = await shouldCheckVersion();
      
      if (shouldCheck) {
        // console.log('Checking for app updates...');
        setShouldFetch(true);
      } else {
        // console.log('Skipping version check (less than 1 hour since last check)');
      }
    };
    
    initializeVersionCheck();
  }, []);

  useEffect(() => {
    if (!data) return;
    
    // Guardar la hora de la consulta
    saveLastCheckTime();
    
    checkForUpdate();
  }, [data]);

  if (showUpdateModal) {
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
            width: 400,
            alignSelf: 'center',
            borderColor: cssVar.cNeutral700,
            borderWidth: 2,
            // use overflow to clip children (Images) to the parent's borderRadius
            overflow: 'hidden',
          }}>
          {/* image selected based on platform */}
          <Image
            source={selectedImage}
            style={{width: '100%', height: 277}}
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
              margin:0,
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
