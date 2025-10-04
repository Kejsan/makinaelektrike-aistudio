import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { FavouriteEntry, UserRole } from '../types';

const FAVORITES_KEY = 'makinaElektrikeFavorites';

const readLocalFavorites = (): string[] => {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (!storedFavorites) {
      return [];
    }

    const parsed = JSON.parse(storedFavorites);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch (error) {
    console.error('Error reading favorites from localStorage', error);
    return [];
  }
};

const writeLocalFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage', error);
  }
};

const favouritesCollection = (uid: string) => collection(firestore, 'users', uid, 'favourites');

export const useFavorites = () => {
  const { user, initializing, role } = useAuth();
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [entries, setEntries] = useState<FavouriteEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (initializing) {
      return () => undefined;
    }

    unsubscribeRef.current?.();
    unsubscribeRef.current = null;

    if (!user) {
      const localFavorites = readLocalFavorites();
      setFavorites(localFavorites);
      setEntries(
        localFavorites.map<FavouriteEntry>((itemId, index) => ({
          id: itemId,
          itemId,
          userId: 'local-user',
          role: null,
          createdAt: null,
          updatedAt: null,
          collection: index.toString(),
        })),
      );
      setLoading(false);
      return () => undefined;
    }

    setLoading(true);
    const collectionRef = favouritesCollection(user.uid);

    const unsubscribe = onSnapshot(
      collectionRef,
      snapshot => {
        const remoteEntries = snapshot.docs.map<FavouriteEntry>(docSnapshot => {
          const data = docSnapshot.data() as Partial<FavouriteEntry> | undefined;
          return {
            id: docSnapshot.id,
            itemId: data?.itemId ?? docSnapshot.id,
            userId: data?.userId ?? user.uid,
            role: (data?.role as UserRole | null | undefined) ?? role ?? null,
            createdAt: data?.createdAt ?? null,
            updatedAt: data?.updatedAt ?? null,
            collection: data?.collection,
          };
        });
        const remoteFavorites = remoteEntries.map(entry => entry.itemId);
        setEntries(remoteEntries);
        setFavorites(remoteFavorites);
        writeLocalFavorites(remoteFavorites);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Failed to subscribe to favourites', error);
        addToast('Failed to load favourites. Showing local data.', 'error');
        const localFavorites = readLocalFavorites();
        setFavorites(localFavorites);
        setEntries([]);
        setLoading(false);
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [addToast, initializing, user]);

  useEffect(() => () => {
    unsubscribeRef.current?.();
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const wasFavorite = favorites.includes(id);
      const previousFavorites = [...favorites];
      const previousEntries = [...entries];
      const optimisticFavorites = wasFavorite
        ? favorites.filter(favoriteId => favoriteId !== id)
        : [...favorites, id];

      setFavorites(optimisticFavorites);
      setEntries(prev =>
        wasFavorite
          ? prev.filter(entry => entry.itemId !== id)
          : [
              ...prev,
              {
                id,
                itemId: id,
                userId: user?.uid ?? 'local-user',
                role: role ?? null,
                createdAt: null,
                updatedAt: null,
              },
            ],
      );

      if (!user) {
        writeLocalFavorites(optimisticFavorites);
        return;
      }

      const favouriteRef = doc(favouritesCollection(user.uid), id);

      try {
        if (wasFavorite) {
          await deleteDoc(favouriteRef);
        } else {
          const payload: Partial<FavouriteEntry> & { itemId: string; userId: string } = {
            itemId: id,
            userId: user.uid,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          };

          if (role) {
            payload.role = role;
          }

          await setDoc(favouriteRef, payload);
        }
      } catch (error) {
        console.error('Failed to toggle favourite', error);
        setFavorites(previousFavorites);
        setEntries(previousEntries);
        addToast('Unable to update favourites. Please try again.', 'error');
      }
    },
    [addToast, entries, favorites, role, user],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, entries, isFavorite, toggleFavorite, loading };
};
