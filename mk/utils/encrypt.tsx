import AES from 'react-native-aes-crypto';
import {encode as btoa, decode as atob} from 'base-64';

export async function encryptData(plaintext: string, secretKey: string) {
  try {
    const iv = await AES.randomKey(16); // IV de 16 bytes para mayor seguridad
    const key = await AES.sha256(secretKey); // Clave de 256 bits

    const encrypted = await AES.encrypt(plaintext, key, iv, 'aes-256-cbc');
    const encryptedBase64 = btoa(encrypted);
    const ivBase64 = btoa(iv);

    return `${ivBase64}:${encryptedBase64}`;
  } catch (error) {
    return plaintext;
    // console.error('Error al encriptar:', error);
    // throw error;
  }
}

export async function decryptData(encryptedData: string, secretKey: string) {
  try {
    const [ivBase64, encryptedBase64] = encryptedData.split(':');
    const iv = atob(ivBase64);
    const encrypted = atob(encryptedBase64);
    const key = await AES.sha256(secretKey);

    const decrypted = await AES.decrypt(encrypted, key, iv, 'aes-256-cbc');
    console.log(
      'mensajedecrypt ***',
      decrypted,
      'iv',
      iv,
      'encrypted',
      encrypted,
      'encryptedBase64',
      encryptedBase64,
      'ivBase64',
      ivBase64,
      'secretKey',
      secretKey,
      'encryptedData',
      encryptedData,
    );
    return decrypted;
  } catch (error) {
    // console.error('Error al desencriptar:', error);
    return encryptedData;
    // throw error;
  }
}

export const isEncrypted = (encryptedData: string) => {
  let iv = '';
  const ivBase64 = (encryptedData + ':').split(':')[0];
  try {
    if (ivBase64) iv = atob(ivBase64);
    console.log('mensaje ***' + iv, iv.length, ivBase64);
    return iv.length == 32;
  } catch (error) {
    console.log('mensaje2 ***' + iv, iv.length, ivBase64);
    return true;
  }
};
