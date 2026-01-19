// mk/services/storage/storage.service.ts
import configApp from '../../../src/config/config';
import type { StorageFile } from './types';

const bunny = (configApp as any).bunny;

class StorageService {
  private hostname = bunny.hostname;        // ← "br.storage.bunnycdn.com"
  private zone = bunny.storageZoneName;     // ← "condaty-dev", "condaty-test", etc.
  private cdn = bunny.cdnUrl;               // ← "https://condaty-dev.bunnycdn.com"
  private apiKey = bunny.apiKey;

  async upload(file: Blob | any, path: string): Promise<StorageFile> {
    // CORRECTO: usamos el hostname de la región (br, la, ny, etc.)
    const url = `https://${this.hostname}/${this.zone}/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: this.apiKey,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Bunny upload failed: ${response.status} ${err}`);
    }

    return {
      path,
      url: `${this.cdn}/${path}`, // ← URL pública (CDN, no el storage directo)
      name: path.split('/').pop() || 'file',
    };
  }

  async delete(path: string): Promise<void> {
    const url = `https://${this.hostname}/${this.zone}/${path}`;
    await fetch(url, {
      method: 'DELETE',
      headers: { AccessKey: this.apiKey },
    });
  }

  url(path: string): string {
    return `${this.cdn}/${path}`; // ← siempre la URL pública del CDN
  }
}

export const storage = new StorageService();