import {launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {resizeImageToWebP} from './images';
interface PropsUploadImage {
  setFormState: any;
  // setImageData: any;
  formState: any;
  showToast: any;
}
interface PropsUploadDocument {
  setFormState: any;
  formState: any;
  showToast: any;
}
export const uploadImage = async ({
  setFormState,
  // setImageData,
  formState,
  showToast,
}: PropsUploadImage) => {
  const exts = ['png', 'jpg', 'jpeg'];
  try {
    const result: any = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 1,
    });
    if (
      !exts.includes(
        result.assets[0].fileName.slice(
          ((result.assets[0].fileName.lastIndexOf('.') - 1) >>> 0) + 2,
        ),
      )
    ) {
      showToast('Solo se permiten imágenes ' + exts.join(', '), 'error');
      return;
    }
    console.log('notresized', result.assets[0].base64.length);
    // setImageData(result.assets[0].uri);
    // const resized: any = await resizeImageToWebP(
    result.assets[0].base64 = await resizeImageToWebP(
      result.assets[0].uri,
      720,
      1024,
      70,
    );
    // setImageData(result.assets[0].base64);

    console.log('resized', result.assets[0].base64.length);

    setFormState({
      ...formState,
      avatar: result.assets[0].base64,
      // avatar: encodeURIComponent(result.assets[0].base64),
      // avatar: encodeURIComponent(resized),
      // avatar: resized,
    });
  } catch (error) {
    showToast('No se seleccionó ninguna imagen ', 'info');
  }
};

export const uploadDocument = async ({
  showToast,
  formState,
  setFormState,
}: PropsUploadDocument) => {
  const exts = ['pdf', 'doc'];
  try {
    const pickedFile: any = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    if (
      !exts.includes(
        pickedFile.name.slice(
          ((pickedFile.name.lastIndexOf('.') - 1) >>> 0) + 2,
        ),
      )
    ) {
      showToast('Solo se permiten archivos ' + exts.join(', '), 'error');
      return;
    }

    await RNFS.readFile(pickedFile.uri, 'base64').then(data => {
      setFormState({
        ...formState,
        file: data,
        ext: pickedFile.name.slice(
          ((pickedFile.name.lastIndexOf('.') - 1) >>> 0) + 2,
        ),
      });
    });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      showToast('Ningún documento seleccionado', 'info');
    } else {
      showToast('Ocurrió un error', 'error');
      console.log(err);
      throw err;
    }
  }
};
