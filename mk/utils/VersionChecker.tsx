import React, {useEffect, useState} from 'react';
import {View, Text, Linking, Platform} from 'react-native';
import VersionCheck from 'react-native-version-check';
import Modal from 'react-native-modal';
import useApi from '../hooks/useApi';

const VersionChecker = ({children}: {children: React.ReactNode}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');
  const {data} = useApi('/app-version', 'GET', {});
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
      console.log('needsUpdate', currentVersion, minVersion);
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
    if (!data) return;
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
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
            Actualización Requerida
          </Text>
          <Text style={{textAlign: 'center', marginBottom: 20, color: '#555'}}>
            Esta versión de la app ya no es compatible. Por favor, actualiza
            para continuar.
          </Text>
          <Text
            onPress={() => Linking.openURL(updateUrl)}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              fontWeight: '600',
            }}>
            Actualizar Ahora
          </Text>
        </View>
      </Modal>
    );
  }

  return children;
};

export default VersionChecker;
