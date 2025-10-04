import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const buildFileName = (file: File) => {
  const parts = file.name.split('.');
  const hasExtension = parts.length > 1;
  const extension = hasExtension ? parts.pop()!.toLowerCase() : '';
  const baseName = sanitizeFileName(parts.join('.')) || 'dealer-image';
  const timestamp = Date.now();
  return hasExtension ? `${timestamp}-${baseName}.${extension}` : `${timestamp}-${baseName}`;
};

export const uploadDealerImage = async (dealerId: string, file: File): Promise<string> => {
  const fileName = buildFileName(file);
  const objectPath = `dealers/${dealerId}/${fileName}`;
  const storageRef = ref(storage, objectPath);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
