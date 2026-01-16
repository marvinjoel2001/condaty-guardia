// mk/services/storage/adapters/BunnyAdapter.ts
import { IStorageAdapter, StorageFile } from '../types';
import configApp from '../../../../src/config/config';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const bunny = (configApp as any).bunny;

export class BunnyAdapter implements IStorageAdapter {
  private hostname = bunny.hostname;
  private zone = bunny.storageZoneName;
  private cdn = bunny.cdnUrl;
  private apiKey = bunny.apiKey;

  async upload(file: Blob | any, path: string): Promise<StorageFile> {
    const url = `https://${this.hostname}/${this.zone}/${path}`;
    
    let body: any;
    const contentType = file.type || 'application/octet-stream';
    
    // Si es React Native y tenemos una URI local, leer como base64 y convertir a ArrayBuffer
    if (Platform.OS !== 'web' && file.uri && file.uri.startsWith('file://')) {
      const filePath = file.uri.replace('file://', '');
      const base64Data = await RNFS.readFile(filePath, 'base64');
      
      // Convertir base64 a Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      body = bytes.buffer;
    } else {
      // Usar el archivo directamente (Blob o similar)
      body = file;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: this.apiKey,
        'Content-Type': contentType,
      },
      body: body,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Bunny upload failed: ${response.status} ${err}`);
    }

    return {
      path,
      url: `${this.cdn}/${path}`,
      name: path.split('/').pop() || 'file',
    };
  }

  async delete(file: StorageFile): Promise<void> {
    const url = `https://${this.hostname}/${this.zone}/${file.path}`;
    await fetch(url, { method: 'DELETE', headers: { AccessKey: this.apiKey } });
  }

  url(path: string): string {
    return `${this.cdn}/${path}`;
  }
}