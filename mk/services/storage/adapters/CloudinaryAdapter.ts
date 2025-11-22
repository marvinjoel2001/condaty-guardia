// mk/services/storage/adapters/CloudinaryAdapter.ts
import { IStorageAdapter, StorageFile } from '../types';
import configApp from '../../../../src/config/config';

const cloudinary = (configApp as any).cloudinary;

export class CloudinaryAdapter implements IStorageAdapter {
  private cloudName = cloudinary.cloudName;
  private uploadPreset = cloudinary.uploadPreset;
  private folder = cloudinary.folder || 'react-native-uploads';

  async upload(file: Blob | any, path: string): Promise<StorageFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', this.folder);
    // Opcional: usar path como public_id (sin carpeta)
    formData.append('public_id', path.split('/').pop()?.split('.')[0]);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return {
      path: data.public_id,
      url: data.secure_url,
      name: data.original_filename || path.split('/').pop() || 'file',
    };
  }

  async delete(publicId: string): Promise<void> {
    // Cloudinary necesita admin secret para borrar → mejor usar un proxy en tu backend
    // Opción segura: hacer DELETE via tu API
    await fetch(`${configApp.API_URL}/cloudinary-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId }),
    });
  }

  url(publicId: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }
}