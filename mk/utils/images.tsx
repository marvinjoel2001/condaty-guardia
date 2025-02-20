import ImageResizer from '@bam.tech/react-native-image-resizer';
// import { encode as encodeWebP } from 'react-native-webp-format';
import RNFS from 'react-native-fs';

const fileUriToBase64 = async (uri: any) => {
  const fs = require('react-native-fs');
  return await fs.readFile(uri, 'base64');
};

export const resizeImageToWebP = async (
  fileUri: any,
  maxWidth: number,
  maxHeight: number,
  quality: number = 70,
) => {
  try {
    // Redimensionar la imagen
    const resizedImage = await ImageResizer.createResizedImage(
      fileUri, // URI de la imagen original
      maxWidth, // Ancho máximo
      maxHeight, // Alto máximo
      'JPEG', // Formato intermedio (usamos JPEG antes de WebP)
      quality, // Calidad máxima para la redimensión inicial
      0, // Rotación
    );

    // Leer la imagen redimensionada como un buffer
    const imageBuffer = await RNFS.readFile(resizedImage.uri, 'base64');

    // const imageBuffer = await fileUriToBase64(resizedImage.uri);

    // Convertir a WebP (compatible con iOS y Android)
    // const webpBase64 = await encodeWebP(imageBuffer, {
    //   quality: 80, // Calidad de la imagen WebP
    //   lossless: false, // Usar WebP con compresión con pérdidas
    // });

    return imageBuffer;
  } catch (error) {
    console.error('Error al convertir la imagen a WebP:', error);
    throw error;
  }
};
