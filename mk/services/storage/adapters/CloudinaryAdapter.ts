// mk/services/storage/adapters/CloudinaryAdapter.ts
import { IStorageAdapter, StorageFile } from '../types';
import configApp from '../../../../src/config/config';

const cloudinary = (configApp as any).cloudinary;

export class CloudinaryAdapter implements IStorageAdapter {
  private cloudName = cloudinary.cloudName;
  private uploadPreset = cloudinary.uploadPreset;
  private folder = cloudinary.folder || 'condaty-mobile';

  async upload(file: Blob | File | any, path: string): Promise<StorageFile> {
    try {
      const filename = path.split('/').pop() || 'file.jpg';
      const publicId = path.replace(/\.[^/.]+$/, ''); // sin extensión
      
      let base64Data: string;
      
      // Si recibimos un objeto con uri (desde React Native image picker)
      if (file.uri) {
        // Leer el archivo como blob usando XMLHttpRequest (más compatible con URIs locales)
        const blob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new TypeError('Error al leer el archivo local'));
          xhr.responseType = 'blob';
          xhr.open('GET', file.uri, true);
          xhr.send(null);
        });
        
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // result viene como "data:image/jpeg;base64,/9j/4AAQ..."
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } 
      // Si recibimos un Blob
      else if (file instanceof Blob) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } 
      // Fallback
      else {
        throw new Error('Formato de archivo no soportado');
      }

      // Cloudinary acepta base64 directamente en el campo 'file'
      const formData = new FormData();
      formData.append('file', base64Data);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', this.folder);
      formData.append('public_id', publicId);

      console.log('📤 Subiendo a Cloudinary:', { publicId, filename });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Cloudinary error:', data);
        throw new Error(data.error?.message || 'Error al subir archivo a Cloudinary');
      }

      console.log('✅ Cloudinary upload exitoso:', data.secure_url);

      // Retornamos el formato esperado
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
      // El path ya contiene el public_id de Cloudinary
      const publicId = file.path;

      console.log('🗑️ Eliminando de Cloudinary:', publicId);

      // Llamar al endpoint de Next.js para borrar
      const response = await fetch(`${configApp.NEXT_API_BASE_URL}/api/cloudinary-upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (!response.ok) {
        console.warn('No se pudo eliminar de Cloudinary a través de Next.js:', publicId);
      }
    } catch (error) {
      console.error('CloudinaryAdapter delete error:', error);
      // No lanzamos error para no bloquear la UI
    }
  }

  url(pathOrUrl: string): string {
    // Si ya es una URL completa, retornarla
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }

    // Si es un path relativo, construir la URL
    const publicId = pathOrUrl.replace(/\.[^/.]+$/, ''); // sin extensión
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }
}