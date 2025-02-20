import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PermissionsAndroid, Platform} from 'react-native';
// import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

export const hasAndroidPermission = async () => {
  const getCheckPermissionPromise = () => {
    if (Platform.Version >= '33') {
      return Promise.all([
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }
  const getRequestPermissionPromise = () => {
    if (Platform.Version >= '33') {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]).then(
        statuses =>
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ).then(status => status === PermissionsAndroid.RESULTS.GRANTED);
    }
  };

  return await getRequestPermissionPromise();
};

export const downloadImage = async (uri: any, showToast: any) => {
  if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
    showToast('No se pudo guardar la imagen', 'error');
    return;
  }
  if (Platform.OS == 'android') {
    // const fileName = `image_${Date.now()}.jpg`;
    // const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    // RNFS.downloadFile({
    //   fromUrl: uri,
    //   toFile: filePath,
    // })
    //   .promise.then(res => {
    //     if (res.statusCode === 200) {
    //       showToast('Imagen guardada con éxito', 'success');
    //     } else {
    //       showToast('No se pudo guardar la imagen', 'error');
    //     }
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     showToast('Error al descargar imagen', 'error');
    //   });

    const {config, fs} = RNFetchBlob;
    const downloadDir = fs.dirs.DownloadDir; // Carpeta de descargas en Android
    // const imageUrl = 'https://ejemplo.com/imagen.jpg'; // URL de la imagen
    const fileName = 'imagen-guaradada.jpg';

    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true, // Utiliza el administrador de descargas de Android
        notification: true, // Muestra una notificación cuando se complete la descarga
        title: fileName,
        description: 'Descargando imagen...',
        mime: 'image/jpeg',
        mediaScannable: true,
        path: `${downloadDir}/${fileName}`, // Ruta donde se guardará la imagen
      },
    })
      .fetch('GET', uri)
      .then(res => {
        // Alert.alert('Descarga completada', `La imagen se guardó en: ${res.path()}`);
        showToast('Imagen guardada con éxito', 'success');
        console.log('La imagen se descargó en:', res.path());
      })
      .catch(error => {
        console.error('Error al descargar la imagen', error);
        // Alert.alert('Error', 'Hubo un problema al descargar la imagen.');
        showToast('Error al guardar imagen', 'error');
      });
  }
  if (Platform.OS == 'ios') {
    CameraRoll.save(uri, {type: 'photo'})
      .then(() => {
        showToast('Imagen guardada con éxito', 'success');
      })
      .catch(err => {
        console.error(err);
        showToast('Error al descargar imagen', 'error');
      });
  }
};
