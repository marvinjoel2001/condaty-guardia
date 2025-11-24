// mk/services/storage/index.ts
import { createStorageAdapter } from './storage.factory';
import type { IStorageAdapter } from './types';

// Creamos el adapter UNA SOLA VEZ cuando la app arranca
const storageAdapter: IStorageAdapter = createStorageAdapter();

// Exportamos como singleton para usar en toda la app
export const storage = storageAdapter;

// También exportamos el tipo por si alguien lo necesita
export type { StorageFile } from './types';