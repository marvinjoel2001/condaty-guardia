// mk/services/storage/adapters/BunnyAdapter.ts
import { IStorageAdapter, StorageFile } from '../types';
import configApp from '../../../../src/config/config';

const bunny = (configApp as any).bunny;

export class BunnyAdapter implements IStorageAdapter {
  private hostname = bunny.hostname;
  private zone = bunny.storageZoneName;
  private cdn = bunny.cdnUrl;
  private apiKey = bunny.apiKey;

  async upload(file: Blob | any, path: string): Promise<StorageFile> {
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
      url: `${this.cdn}/${path}`,
      name: path.split('/').pop() || 'file',
    };
  }

  async delete(path: string): Promise<void> {
    const url = `https://${this.hostname}/${this.zone}/${path}`;
    await fetch(url, { method: 'DELETE', headers: { AccessKey: this.apiKey } });
  }

  url(path: string): string {
    return `${this.cdn}/${path}`;
  }
}