import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const buildFileName = (file: File, fallbackBase: string) => {
  const parts = file.name.split('.');
  const hasExtension = parts.length > 1;
  const extension = hasExtension ? parts.pop()!.toLowerCase() : '';
  const baseName = sanitizeFileName(parts.join('.')) || fallbackBase;
  const timestamp = Date.now();
  return hasExtension ? `${timestamp}-${baseName}.${extension}` : `${timestamp}-${baseName}`;
};

const uploadFile = async (objectPath: string, file: File): Promise<string> => {
  const storageRef = ref(storage, objectPath);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const buildObjectPath = (segments: string[]) => segments.filter(Boolean).join('/');

const uploadDealerMedia = async (
  dealerId: string,
  file: File,
  variant: 'hero' | 'gallery',
): Promise<string> => {
  const folder = variant === 'hero' ? 'hero' : 'gallery';
  const fileName = buildFileName(file, `dealer-${folder}`);
  const objectPath = buildObjectPath(['dealers', dealerId, folder, fileName]);
  return uploadFile(objectPath, file);
};

const uploadModelMedia = async (
  modelId: string,
  file: File,
  variant: 'hero' | 'gallery',
): Promise<string> => {
  const folder = variant === 'hero' ? 'hero' : 'gallery';
  const fileName = buildFileName(file, `model-${folder}`);
  const objectPath = buildObjectPath(['models', modelId, folder, fileName]);
  return uploadFile(objectPath, file);
};

export const uploadDealerHeroImage = (dealerId: string, file: File) =>
  uploadDealerMedia(dealerId, file, 'hero');

export const uploadDealerGalleryImage = (dealerId: string, file: File) =>
  uploadDealerMedia(dealerId, file, 'gallery');

export const uploadModelHeroImage = (modelId: string, file: File) => uploadModelMedia(modelId, file, 'hero');

export const uploadModelGalleryImage = (modelId: string, file: File) =>
  uploadModelMedia(modelId, file, 'gallery');
