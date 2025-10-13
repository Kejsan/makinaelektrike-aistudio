import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Dealer, DealerDocument, Model, DealerModel, BlogPost } from '../types';

type WithId<T> = T & { id: string };

type SnapshotMapper<T> = (snapshot: QueryDocumentSnapshot<DocumentData>) => T;

const createCollectionMapper = <T extends { id: string }>(
  mapper?: SnapshotMapper<T>,
) => {
  const defaultMapper: SnapshotMapper<T> = snapshot =>
    ({ id: snapshot.id, ...(snapshot.data() as Record<string, unknown>) } as T);

  const mapFn = mapper ?? defaultMapper;

  return (snapshot: QuerySnapshot<DocumentData>): T[] =>
    snapshot.docs.map(docSnapshot => mapFn(docSnapshot));
};

const dealersCollection = collection(firestore, 'dealers');
const modelsCollection = collection(firestore, 'models');
const blogPostsCollection = collection(firestore, 'blogPosts');
const dealerModelsCollection = collection(firestore, 'dealerModels');

const mapDealers = createCollectionMapper<Dealer>();
const mapModels = createCollectionMapper<Model>();
const mapBlogPosts = createCollectionMapper<BlogPost>();
const mapDealerModels = createCollectionMapper<WithId<DealerModel>>();
const mapDealerModelsWithoutId = (snapshot: QuerySnapshot<DocumentData>): DealerModel[] =>
  mapDealerModels(snapshot).map(({ id: _id, ...rest }) => rest);

type SnapshotCallback<T> = (items: T[]) => void;

type SubscriptionOptions<T> = {
  onData: SnapshotCallback<T>;
  onError?: (error: FirestoreError) => void;
};

const subscribeToCollection = <T extends { id: string }>(
  colQuery: ReturnType<typeof query>,
  mapper: (snapshot: QuerySnapshot<DocumentData>) => T[],
  options: SubscriptionOptions<T>,
): Unsubscribe =>
  onSnapshot(colQuery, snapshot => options.onData(mapper(snapshot)), options.onError);

export const listDealers = async (): Promise<Dealer[]> => {
  const snapshot = await getDocs(query(dealersCollection, orderBy('name', 'asc')));
  return mapDealers(snapshot);
};

export const getDealerById = async (id: string): Promise<Dealer | null> => {
  const snapshot = await getDoc(doc(dealersCollection, id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Dealer, 'id'>) };
};

export const createDealer = async (payload: DealerDocument): Promise<Dealer> => {
  const docRef = await addDoc(dealersCollection, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...(snapshot.data() as DealerDocument) };
};

export const updateDealer = async (id: string, updates: Partial<DealerDocument>): Promise<Dealer> => {
  const dealerRef = doc(dealersCollection, id);
  await updateDoc(dealerRef, { ...updates, updatedAt: serverTimestamp() });
  const snapshot = await getDoc(dealerRef);
  return { id: snapshot.id, ...(snapshot.data() as DealerDocument) };
};

export const deleteDealer = async (id: string): Promise<void> => {
  await deleteDoc(doc(dealersCollection, id));

  const linksSnapshot = await getDocs(query(dealerModelsCollection, where('dealer_id', '==', id)));
  const deletions = linksSnapshot.docs.map(link => deleteDoc(link.ref));
  await Promise.all(deletions);
};

export const subscribeToDealers = (
  options: SubscriptionOptions<Dealer>,
): Unsubscribe => {
  const dealersQuery = query(dealersCollection, orderBy('name', 'asc'));
  return subscribeToCollection(dealersQuery, mapDealers, options);
};

export const subscribeToDealersByOwner = (
  ownerUid: string,
  options: SubscriptionOptions<Dealer>,
): Unsubscribe => {
  const dealersQuery = query(dealersCollection, where('ownerUid', '==', ownerUid));
  return subscribeToCollection(dealersQuery, mapDealers, options);
};

export const listModels = async (): Promise<Model[]> => {
  const snapshot = await getDocs(query(modelsCollection, orderBy('brand', 'asc'), orderBy('model_name', 'asc')));
  return mapModels(snapshot);
};

export const getModelById = async (id: string): Promise<Model | null> => {
  const snapshot = await getDoc(doc(modelsCollection, id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Model, 'id'>) };
};

export const createModel = async (payload: Omit<Model, 'id'>): Promise<Model> => {
  const docRef = await addDoc(modelsCollection, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...(snapshot.data() as Omit<Model, 'id'>) };
};

export const updateModel = async (id: string, updates: Partial<Omit<Model, 'id'>>): Promise<Model> => {
  const modelRef = doc(modelsCollection, id);
  await updateDoc(modelRef, { ...updates, updatedAt: serverTimestamp() });
  const snapshot = await getDoc(modelRef);
  return { id: snapshot.id, ...(snapshot.data() as Omit<Model, 'id'>) };
};

export const deleteModel = async (id: string): Promise<void> => {
  await deleteDoc(doc(modelsCollection, id));

  const linksSnapshot = await getDocs(query(dealerModelsCollection, where('model_id', '==', id)));
  const deletions = linksSnapshot.docs.map(link => deleteDoc(link.ref));
  await Promise.all(deletions);
};

export const subscribeToModels = (
  options: SubscriptionOptions<Model>,
): Unsubscribe => {
  const modelsQuery = query(modelsCollection, orderBy('brand', 'asc'), orderBy('model_name', 'asc'));
  return subscribeToCollection(modelsQuery, mapModels, options);
};

export const subscribeToModelsByOwner = (
  ownerUid: string,
  options: SubscriptionOptions<Model>,
): Unsubscribe => {
  const modelsQuery = query(modelsCollection, where('ownerUid', '==', ownerUid));
  return subscribeToCollection(modelsQuery, mapModels, options);
};

export const listBlogPosts = async (): Promise<BlogPost[]> => {
  const snapshot = await getDocs(query(blogPostsCollection, orderBy('date', 'desc')));
  return mapBlogPosts(snapshot);
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const snapshot = await getDoc(doc(blogPostsCollection, id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<BlogPost, 'id'>) };
};

export const createBlogPost = async (payload: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
  const docRef = await addDoc(blogPostsCollection, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = snapshot.data() as Record<string, unknown>;

  return { id: snapshot.id, ...(rest as Omit<BlogPost, 'id'>) };
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
  const postRef = doc(blogPostsCollection, id);
  await updateDoc(postRef, { ...updates, updatedAt: serverTimestamp() });
  const snapshot = await getDoc(postRef);
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = snapshot.data() as Record<string, unknown>;
  return { id: snapshot.id, ...(rest as Omit<BlogPost, 'id'>) };
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await deleteDoc(doc(blogPostsCollection, id));
};

export const subscribeToBlogPosts = (
  options: SubscriptionOptions<BlogPost>,
): Unsubscribe => {
  const postsQuery = query(blogPostsCollection, orderBy('date', 'desc'));
  return subscribeToCollection(postsQuery, mapBlogPosts, options);
};

export const listDealerModels = async (): Promise<DealerModel[]> => {
  const snapshot = await getDocs(dealerModelsCollection);
  return mapDealerModels(snapshot).map(({ id: _id, ...rest }) => rest);
};

export const subscribeToDealerModels = (
  options: SubscriptionOptions<DealerModel>,
): Unsubscribe =>
  onSnapshot(
    dealerModelsCollection,
    snapshot => {
      const mapped = mapDealerModels(snapshot).map(({ id: _id, ...rest }) => rest);
      options.onData(mapped);
    },
    options.onError,
  );

export const subscribeToDealerModelsForDealers = (
  dealerIds: string[],
  options: SubscriptionOptions<DealerModel>,
): Unsubscribe => {
  const uniqueIds = Array.from(new Set(dealerIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    options.onData([]);
    return () => {};
  }

  if (uniqueIds.length === 1) {
    const dealerQuery = query(dealerModelsCollection, where('dealer_id', '==', uniqueIds[0]!));
    return subscribeToCollection(dealerQuery, mapDealerModelsWithoutId, options);
  }

  const limitedIds = uniqueIds.slice(0, 10);
  if (uniqueIds.length > limitedIds.length) {
    console.warn(
      'subscribeToDealerModelsForDealers: truncating dealer ID list to the first 10 entries to satisfy Firestore query limits.',
    );
  }

  const dealerQuery = query(dealerModelsCollection, where('dealer_id', 'in', limitedIds));
  return subscribeToCollection(dealerQuery, mapDealerModelsWithoutId, options);
};

const buildDealerModelId = (dealerId: string, modelId: string) => `${dealerId}_${modelId}`;

export const createDealerModel = async (
  dealerId: string,
  modelId: string,
  createdBy?: string,
): Promise<DealerModel> => {
  const linkRef = doc(dealerModelsCollection, buildDealerModelId(dealerId, modelId));
  await setDoc(linkRef, {
    dealer_id: dealerId,
    model_id: modelId,
    createdAt: serverTimestamp(),
    ...(createdBy ? { createdBy } : {}),
  });
  return { dealer_id: dealerId, model_id: modelId };
};

export const deleteDealerModel = async (dealerId: string, modelId: string): Promise<void> => {
  await deleteDoc(doc(dealerModelsCollection, buildDealerModelId(dealerId, modelId)));
};
