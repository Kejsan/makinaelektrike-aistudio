import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { auth, firestore } from '../services/firebase';

export type UserRole = 'admin' | 'dealer' | 'user' | 'pending';

export interface UserProfile {
  uid: string;
  email?: string | null;
  role: UserRole;
  displayName?: string | null;
  status?: 'pending' | 'approved';
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  registerUser: (
    email: string,
    password: string,
    profile?: Partial<UserProfile>
  ) => Promise<void>;
  registerDealer: (
    email: string,
    password: string,
    profile?: Partial<UserProfile>
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  approveDealer: (uid: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type FirestoreUser = DocumentData & { role?: UserRole };

const deriveRole = (role?: UserRole | string | null): UserRole | null => {
  if (!role) {
    return null;
  }
  if (role === 'admin' || role === 'dealer' || role === 'user' || role === 'pending') {
    return role;
  }
  return null;
};

const mapErrorToMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected authentication error occurred.';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setProfile(null);
        setRole(null);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as FirestoreUser;
          const resolvedRole = deriveRole(data.role) ?? 'user';
          const mergedProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: resolvedRole,
            ...data,
          };
          setProfile(mergedProfile);
          setRole(resolvedRole);
        } else {
          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
          };
          await setDoc(userRef, {
            role: 'user',
            email: firebaseUser.email,
            createdAt: serverTimestamp(),
          });
          setProfile(fallbackProfile);
          setRole('user');
        }
      } catch (fetchError) {
        console.error('Failed to load user profile', fetchError);
        setError('Failed to load user profile.');
        setProfile(null);
        setRole(null);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setError(null);

      await loadProfile(currentUser);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const registerUser = useCallback<
    AuthContextType['registerUser']
  >(async (email, password, profileData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(firestore, 'users', credential.user.uid);
      await setDoc(userRef, {
        uid: credential.user.uid,
        email: credential.user.email,
        role: 'user',
        createdAt: serverTimestamp(),
        ...profileData,
      });
      await loadProfile(credential.user);
    } catch (registerError) {
      const message = mapErrorToMessage(registerError);
      setError(message);
      throw registerError;
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const registerDealer = useCallback<
    AuthContextType['registerDealer']
  >(async (email, password, profileData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(firestore, 'users', credential.user.uid);
      await setDoc(userRef, {
        uid: credential.user.uid,
        email: credential.user.email,
        role: 'pending',
        status: 'pending',
        createdAt: serverTimestamp(),
        ...profileData,
      });
      await loadProfile(credential.user);
    } catch (registerError) {
      const message = mapErrorToMessage(registerError);
      setError(message);
      throw registerError;
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await loadProfile(credential.user);
    } catch (loginError) {
      const message = mapErrorToMessage(loginError);
      setError(message);
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setProfile(null);
      setRole(null);
    } catch (logoutError) {
      const message = mapErrorToMessage(logoutError);
      setError(message);
      throw logoutError;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveDealer = useCallback(async (uid: string) => {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      role: 'dealer',
      status: 'approved',
      approvedAt: serverTimestamp(),
    });

    if (user?.uid === uid) {
      setRole('dealer');
      setProfile((current) =>
        current
          ? {
              ...current,
              role: 'dealer',
              status: 'approved',
            }
          : null
      );
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(auth.currentUser);
  }, [loadProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      profile,
      loading,
      initializing,
      error,
      registerUser,
      registerDealer,
      login,
      logout,
      approveDealer,
      refreshProfile,
    }),
    [approveDealer, error, initializing, loading, login, logout, profile, registerDealer, registerUser, refreshProfile, role, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
