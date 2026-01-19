import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    // En React Native, primero intentamos leer el archivo con RNFS
    if (Platform.OS !== 'web' && uri.startsWith('file://')) {
      const filePath = uri.replace('file://', '');
      const base64Data = await RNFS.readFile(filePath, 'base64');
      
      // En React Native, crear Blob desde base64 usando fetch data URI
      const response = await fetch(`data:application/octet-stream;base64,${base64Data}`);
      return await response.blob();
    }
    
    // Para web o URIs http/https, usar fetch
    const response = await fetch(uri);
    if (response.ok) {
      return await response.blob();
    }
    
    throw new Error(`Fetch failed with status ${response.status}`);
  } catch (error) {
    console.error('Error en uriToBlob:', error);
    throw new TypeError(`Network request failed: ${error}`);
  }
};