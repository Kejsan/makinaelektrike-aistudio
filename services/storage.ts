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

export const uploadDealerImage = async (dealerId: string, file: File): Promise<string> => {
  const fileName = buildFileName(file, 'dealer-image');
  const objectPath = `dealers/${dealerId}/${fileName}`;
  return uploadFile(objectPath, file);
};

export const uploadModelImage = async (modelId: string, file: File): Promise<string> => {
  const fileName = buildFileName(file, 'model-image');
  const objectPath = `models/${modelId}/${fileName}`;
  return uploadFile(objectPath, file);
};
