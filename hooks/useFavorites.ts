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
      setLoading(false);
      return () => undefined;
    }

    setLoading(true);
    const collectionRef = favouritesCollection(user.uid);

    const unsubscribe = onSnapshot(
      collectionRef,
      snapshot => {
        const remoteFavorites = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data() as { itemId?: string } | undefined;
          return data?.itemId ?? docSnapshot.id;
        });
        setFavorites(remoteFavorites);
        writeLocalFavorites(remoteFavorites);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Failed to subscribe to favourites', error);
        addToast('Failed to load favourites. Showing local data.', 'error');
        const localFavorites = readLocalFavorites();
        setFavorites(localFavorites);
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
      const optimisticFavorites = wasFavorite
        ? favorites.filter(favoriteId => favoriteId !== id)
        : [...favorites, id];

      setFavorites(optimisticFavorites);

      if (!user) {
        writeLocalFavorites(optimisticFavorites);
        return;
      }

      const favouriteRef = doc(favouritesCollection(user.uid), id);

      try {
        if (wasFavorite) {
          await deleteDoc(favouriteRef);
        } else {
          const payload: Record<string, unknown> = {
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
        addToast('Unable to update favourites. Please try again.', 'error');
      }
    },
    [addToast, favorites, role, user],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, isFavorite, toggleFavorite, loading };
};
