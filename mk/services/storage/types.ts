export type StorageFile = {
  path: string;     // ej: "12345/incidents/1735689123_foto.jpg"
  url: string;      // ej: "https://condaty-test.bunnycdn.com/12345/..."
  name: string;
};

export interface IStorageAdapter {
  upload(file: Blob | File | any, path: string): Promise<StorageFile>;
  delete(file: StorageFile): Promise<void>;
  url(path: string): string;
}