import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { resizeImageToWebP } from './images';
interface PropsUploadImage {
  setFormState: any;
  // setImageData: any;
  formState: any;
  name?: string;
  showToast: any;
  formatted?: boolean;
}
interface PropsUploadDocument {
  setFormState: any;
  formState: any;
  showToast: any;
}
export const uploadImage = ({
  setFormState,
  // setImageData,
  name = 'avatar',
  formatted = false,
  formState,
  showToast,
}: PropsUploadImage) => {
  const exts = ['png', 'jpg', 'jpeg'];

  const processImage = async (result: any) => {
    try {
      // Si el usuario canceló
      if (result.didCancel) {
        return;
      }

      // Si hubo un error
      if (result.errorCode) {
        showToast('Ocurrió un error al seleccionar la imagen', 'error');
        return;
      }

      // Verificar que hay assets
      if (!result.assets || result.assets.length === 0) {
        return;
      }

      const fileName = result.assets[0].fileName || '';
      const fileExt = fileName
        .slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
        .toLowerCase();

      if (!exts.includes(fileExt)) {
        showToast('Solo se permiten imágenes ' + exts.join(', '), 'error');
        return;
      }

      console.log('notresized', result.assets[0].base64?.length || 0);

      const resizedBase64 = await resizeImageToWebP(
        result.assets[0].uri,
        720,
        1024,
        70,
      );

      // console.log('resized', resizedBase64.length);
      if (!formatted) {
        setFormState({
          ...formState,
          [name]: resizedBase64,
        });
      } else {
        setFormState({
          ...formState,
          [name]: {
            file: encodeURIComponent(resizedBase64),
            ext: 'webp',
          },
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      showToast('Error al procesar la imagen', 'error');
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de cámara',
            message:
              'La aplicación necesita acceso a tu cámara para tomar fotos',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting camera permission:', err);
        return false;
      }
    }
    return true; // iOS maneja los permisos automáticamente
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      showToast('Se necesita permiso de cámara', 'error');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        quality: 1,
        saveToPhotos: false,
        cameraType: 'back',
      });
      await processImage(result);
    } catch (error) {
      console.error('Error launching camera:', error);
      showToast(
        'Error al abrir la cámara: ' + (error as any)?.message,
        'error',
      );
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 1,
        selectionLimit: 1,
        // Usar el Photo Picker de Android (no requiere permisos)
        presentationStyle: 'fullScreen',
      });
      await processImage(result);
    } catch (error) {
      console.error('Error launching gallery:', error);
      showToast(
        'Error al abrir la galería: ' + (error as any)?.message,
        'error',
      );
    }
  };

  // Mostrar el selector nativo del sistema operativo
  Alert.alert(
    'Seleccionar imagen',
    'Elige de dónde quieres obtener la imagen',
    [
      {
        text: 'Cámara',
        onPress: () => {
          openCamera();
        },
      },
      {
        text: 'Galería',
        onPress: () => {
          openGallery();
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ],
  );
};

export const uploadDocument = async ({
  showToast,
  formState,
  setFormState,
}: PropsUploadDocument) => {
  const exts = ['pdf', 'doc'];
  try {
    const [pickedFile] = await pick();

    if (!pickedFile) {
      showToast('Ningún documento seleccionado', 'info');
      return;
    }

    const fileExt =
      pickedFile.name?.slice(
        ((pickedFile.name.lastIndexOf('.') - 1) >>> 0) + 2,
      ) || '';

    if (!exts.includes(fileExt)) {
      showToast('Solo se permiten archivos ' + exts.join(', '), 'error');
      return;
    }

    await RNFS.readFile(pickedFile.uri, 'base64').then(data => {
      setFormState({
        ...formState,
        file: data,
        ext: fileExt,
      });
    });
  } catch (err: any) {
    if (err.code === 'DOCUMENT_PICKER_CANCELED') {
      showToast('Ningún documento seleccionado', 'info');
      return;
    }
    showToast('Ocurrió un error', 'error');
    console.log(err);
    throw err;
  }
};
