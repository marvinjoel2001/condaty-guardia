// mk/services/storage/adapters/CloudinaryAdapter.ts
import {IStorageAdapter, StorageFile} from '../types';
import configApp from '../../../../src/config/config';
const cloudinary = (configApp as any).cloudinary;

export class CloudinaryAdapter implements IStorageAdapter {
  private cloudName = cloudinary.cloudName;
  private uploadPreset = cloudinary.uploadPreset; // UNSIGNED
  private folder = cloudinary.folder || 'condaty-mobile';

  // Mapper de MIME types (fácil de extender)
  private getMimeTypeFromExtension(extension: string): string {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      zip: 'application/zip',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return map[extension.toLowerCase()] || 'application/octet-stream';
  }

  async upload(file: any, path: string): Promise<StorageFile> {
    try {
      const filename = path.split('/').pop() || 'file.jpg';
      const extension = (filename.split('.').pop() || '').toLowerCase();
      const publicId = path.replace(/\.[^/.]+$/, '');

      const isDocument = ['pdf', 'doc', 'docx', 'txt', 'zip', 'xlsx'].includes(extension);
      const resourceType = isDocument ? 'raw' : 'image'; // Endpoint dinámico

      const formData = new FormData();

      if (file.uri) {
        const mimeType = this.getMimeTypeFromExtension(extension);

        formData.append('file', {
          uri: file.uri,
          type: mimeType,
          name: file.name || filename,
        } as any);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', this.folder);
      formData.append('public_id', publicId);

     // console.log('📤 Subiendo a Cloudinary como:', resourceType, { publicId, filename });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Cloudinary error:', data);
        throw new Error(data.error?.message || 'Error al subir archivo a Cloudinary');
      }
     // console.log('🌐 Payload mandando...', formData);
     // console.log('🌐 Cloudinary response recibida', response);
     // console.log('✅ Cloudinary upload exitoso:', data.secure_url);

      return {
        path: data.public_id + (isDocument ? '.' + extension : ''),
        url: data.secure_url, // ← Esta es la que debes pasar siempre al backend
        name: data.original_filename || filename,
      };
    } catch (error) {
      console.error('💥 CloudinaryAdapter upload error:', error);
      throw error;
    }
  }

  async delete(file: StorageFile): Promise<void> {
    try {
      const extensionMatch = file.path.match(/\.([^.\/]+)$/);
      const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
      const isDocument = ['pdf', 'doc', 'docx', 'txt', 'zip', 'xlsx'].includes(extension);
      const resourceType = isDocument ? 'raw' : 'image';

      const publicId = file.path;

      const response = await fetch(
        `${configApp.NEXT_API_BASE_URL}/api/cloudinary-upload`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId, resource_type: resourceType }),
        },
      );

      if (!response.ok) {
        console.warn('No se pudo eliminar de Cloudinary:', publicId);
      }
    } catch (error) {
      console.error('CloudinaryAdapter delete error:', error);
    }
  }

  // <<< FIX FINAL: fuerza descarga en documentos raw >>>
  url(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      // Si es un archivo raw (PDF, doc, etc.) agregamos fl_attachment para forzar descarga
      if (pathOrUrl.includes('/raw/upload/')) {
        return `${pathOrUrl}?fl_attachment`;
      }
      // Imágenes: devolvemos tal cual (optimizadas por Cloudinary)
      return pathOrUrl;
    }
    // Fallback (solo por compatibilidad vieja)
    return pathOrUrl;
  }
  // <<< FIN FIX >>>
}