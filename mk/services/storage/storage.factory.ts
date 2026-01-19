// mk/services/storage/storage.factory.ts
import { IStorageAdapter } from './types';
import { BunnyAdapter } from './adapters/BunnyAdapter';
import { CloudinaryAdapter } from './adapters/CloudinaryAdapter';
import configApp from '../../../src/config/config';

export const createStorageAdapter = (): IStorageAdapter => {
  const strategy = (configApp as any).storageStrategy || 'bunny'; // ← nueva config

  switch (strategy) {
    case 'cloudinary':
      return new CloudinaryAdapter();
    case 'bunny':
    default:
      return new BunnyAdapter();
  }
};