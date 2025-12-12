// mk/services/storage/adapters/CloudinaryAdapter.ts
import { IStorageAdapter, StorageFile } from '../types';
import configApp from '../../../../src/config/config';

const cloudinary = (configApp as any).cloudinary;

export class CloudinaryAdapter implements IStorageAdapter {
  private cloudName = cloudinary.cloudName;
  private uploadPreset = cloudinary.uploadPreset; // Debe ser UNSIGNED
  private folder = cloudinary.folder || 'condaty-mobile';

  async upload(file: any, path: string): Promise<StorageFile> {
    try {
      const filename = path.split('/').pop() || 'file.jpg';
      const publicId = path.replace(/\.[^/.]+$/, ''); // sin extensión

      const formData = new FormData();

      // Caso principal: archivo desde React Native (image-picker, camera, etc.)
      if (file.uri) {
        formData.append('file', {
          uri: file.uri,
          type: file.type || file.mime || 'image/jpeg', // importante: type o mime
          name: file.name || filename,
        } as any);

        // Opcional: si tienes el tamaño
        // if (file.fileSize) formData.append('fileSize', file.fileSize);
      }
      // Caso web o si ya tienes Blob/File (raro en RN, pero por compatibilidad)
      else if (file instanceof Blob || file instanceof File) {
        // formData.append('file', file, filename);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

      // Parámetros de Cloudinary
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', this.folder);
      formData.append('public_id', publicId);

      console.log('📤 Subiendo a Cloudinary:', {
        publicId,
        filename,
        uri: file.uri,
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
          // NO pongas Content-Type manualmente! fetch lo calcula con boundary
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Cloudinary error:', data);
        throw new Error(
          data.error?.message || 'Error al subir archivo a Cloudinary',
        );
      }

      console.log('✅ Cloudinary upload exitoso:', data.secure_url);

      return {
        path: data.public_id,
        url: data.secure_url,
        name: data.original_filename || filename,
      };
    } catch (error) {
      console.error('💥 CloudinaryAdapter upload error:', error);
      throw error;
    }
  }

  async delete(file: StorageFile): Promise<void> {
    try {
      const publicId = file.path;

      console.log('🗑️ Eliminando de Cloudinary:', publicId);

      // Tu backend firma la destrucción (recomendado por seguridad)
      const response = await fetch(
        `${configApp.NEXT_API_BASE_URL}/api/cloudinary-upload`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        },
      );

      if (!response.ok) {
        console.warn(
          'No se pudo eliminar de Cloudinary a través de Next.js:',
          publicId,
        );
      }
    } catch (error) {
      console.error('CloudinaryAdapter delete error:', error);
      // No re-lanzamos para no romper flujo
    }
  }

  url(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }

    const publicId = pathOrUrl.replace(/\.[^/.]+$/, '');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }
}
