export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export type StorageDriver = 'local' | 'gcs' | 's3' | 'cloudinary';
