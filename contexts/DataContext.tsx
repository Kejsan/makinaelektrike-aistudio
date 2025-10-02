import React, {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import {
  getDealers,
  getModels,
  getBlogPosts,
  createDealer as apiCreateDealer,
  updateDealer as apiUpdateDealer,
  deleteDealer as apiDeleteDealer,
  createModel as apiCreateModel,
  updateModel as apiUpdateModel,
  deleteModel as apiDeleteModel,
  createBlogPost as apiCreateBlogPost,
  updateBlogPost as apiUpdateBlogPost,
  deleteBlogPost as apiDeleteBlogPost,
} from '../services/api';
import { Dealer, Model, BlogPost } from '../types';

type DealerInput = Omit<Dealer, 'id'>;
type DealerUpdate = Partial<Dealer>;
type ModelInput = Omit<Model, 'id'>;
type ModelUpdate = Partial<Model>;
type BlogPostInput = Omit<BlogPost, 'id'>;
type BlogPostUpdate = Partial<BlogPost>;

type EntityKey = 'dealers' | 'models' | 'blogPosts';
type Operation = 'create' | 'update' | 'delete';

interface MutationFlag {
  loading: boolean;
  error: string | null;
}

type EntityMutations = Record<Operation, MutationFlag>;

type MutationState = Record<EntityKey, EntityMutations>;

interface DataState {
  dealers: Dealer[];
  models: Model[];
  blogPosts: BlogPost[];
  loading: boolean;
  error: string | null;
}

interface DataContextType {
  dealers: Dealer[];
  models: Model[];
  blogPosts: BlogPost[];
  loading: boolean;
  loadError: string | null;
  dealerMutations: EntityMutations;
  modelMutations: EntityMutations;
  blogPostMutations: EntityMutations;
  addDealer: (dealer: DealerInput) => Promise<Dealer>;
  updateDealer: (id: string, updates: DealerUpdate) => Promise<Dealer>;
  deleteDealer: (id: string) => Promise<void>;
  addModel: (model: ModelInput) => Promise<Model>;
  updateModel: (id: string, updates: ModelUpdate) => Promise<Model>;
  deleteModel: (id: string) => Promise<void>;
  addBlogPost: (post: BlogPostInput) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: BlogPostUpdate) => Promise<BlogPost>;
  deleteBlogPost: (id: string) => Promise<void>;
}

const createMutationFlag = (): MutationFlag => ({ loading: false, error: null });

const createEntityMutations = (): EntityMutations => ({
  create: createMutationFlag(),
  update: createMutationFlag(),
  delete: createMutationFlag(),
});

const createInitialMutationState = (): MutationState => ({
  dealers: createEntityMutations(),
  models: createEntityMutations(),
  blogPosts: createEntityMutations(),
});

type MutationAction =
  | { type: 'start'; entity: EntityKey; operation: Operation }
  | { type: 'success'; entity: EntityKey; operation: Operation }
  | { type: 'error'; entity: EntityKey; operation: Operation; error: string };

const mutationReducer = (state: MutationState, action: MutationAction): MutationState => {
  const entityState = state[action.entity];
  const nextOperationState: MutationFlag = (() => {
    switch (action.type) {
      case 'start':
        return { loading: true, error: null };
      case 'success':
        return { loading: false, error: null };
      case 'error':
        return { loading: false, error: action.error };
      default:
        return entityState[action.operation];
    }
  })();

  return {
    ...state,
    [action.entity]: {
      ...entityState,
      [action.operation]: nextOperationState,
    },
  };
};

type DataAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { dealers: Dealer[]; models: Model[]; blogPosts: BlogPost[] } }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD_DEALER'; payload: Dealer }
  | { type: 'UPDATE_DEALER'; payload: Dealer }
  | { type: 'DELETE_DEALER'; payload: string }
  | { type: 'ADD_MODEL'; payload: Model }
  | { type: 'UPDATE_MODEL'; payload: Model }
  | { type: 'DELETE_MODEL'; payload: string }
  | { type: 'ADD_BLOG_POST'; payload: BlogPost }
  | { type: 'UPDATE_BLOG_POST'; payload: BlogPost }
  | { type: 'DELETE_BLOG_POST'; payload: string };

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        dealers: action.payload.dealers,
        models: action.payload.models,
        blogPosts: action.payload.blogPosts,
        loading: false,
        error: null,
      };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_DEALER':
      return { ...state, dealers: [...state.dealers, action.payload] };
    case 'UPDATE_DEALER':
      return {
        ...state,
        dealers: state.dealers.map(dealer =>
          dealer.id === action.payload.id ? action.payload : dealer
        ),
      };
    case 'DELETE_DEALER':
      return { ...state, dealers: state.dealers.filter(dealer => dealer.id !== action.payload) };
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] };
    case 'UPDATE_MODEL':
      return {
        ...state,
        models: state.models.map(model => (model.id === action.payload.id ? action.payload : model)),
      };
    case 'DELETE_MODEL':
      return { ...state, models: state.models.filter(model => model.id !== action.payload) };
    case 'ADD_BLOG_POST':
      return { ...state, blogPosts: [...state.blogPosts, action.payload] };
    case 'UPDATE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post => (post.id === action.payload.id ? action.payload : post)),
      };
    case 'DELETE_BLOG_POST':
      return { ...state, blogPosts: state.blogPosts.filter(post => post.id !== action.payload) };
    default:
      return state;
  }
};

const rejectUsage = async () => {
  throw new Error('DataProvider not initialized');
};

const defaultMutationState = createInitialMutationState();

export const DataContext = createContext<DataContextType>({
  dealers: [],
  models: [],
  blogPosts: [],
  loading: true,
  loadError: null,
  dealerMutations: defaultMutationState.dealers,
  modelMutations: defaultMutationState.models,
  blogPostMutations: defaultMutationState.blogPosts,
  addDealer: rejectUsage as DataContextType['addDealer'],
  updateDealer: rejectUsage as DataContextType['updateDealer'],
  deleteDealer: rejectUsage as DataContextType['deleteDealer'],
  addModel: rejectUsage as DataContextType['addModel'],
  updateModel: rejectUsage as DataContextType['updateModel'],
  deleteModel: rejectUsage as DataContextType['deleteModel'],
  addBlogPost: rejectUsage as DataContextType['addBlogPost'],
  updateBlogPost: rejectUsage as DataContextType['updateBlogPost'],
  deleteBlogPost: rejectUsage as DataContextType['deleteBlogPost'],
});

interface DataProviderProps {
  children: ReactNode;
}

const initialDataState: DataState = {
  dealers: [],
  models: [],
  blogPosts: [],
  loading: true,
  error: null,
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dataState, dataDispatch] = useReducer(dataReducer, initialDataState);
  const [mutationState, mutationDispatch] = useReducer(mutationReducer, createInitialMutationState());

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      dataDispatch({ type: 'LOAD_START' });

      try {
        const [dealersData, modelsData, blogPostsData] = await Promise.all([
          getDealers(),
          getModels(),
          getBlogPosts(),
        ]);

        if (!isMounted) {
          return;
        }

        dataDispatch({
          type: 'LOAD_SUCCESS',
          payload: {
            dealers: dealersData,
            models: modelsData,
            blogPosts: blogPostsData,
          },
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Failed to load data';
        dataDispatch({ type: 'LOAD_ERROR', payload: message });
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const runMutation = useCallback(
    async <T,>(
      entity: EntityKey,
      operation: Operation,
      request: () => Promise<T>,
      onSuccess: (result: T) => void,
    ) => {
      mutationDispatch({ type: 'start', entity, operation });

      try {
        const result = await request();
        onSuccess(result);
        mutationDispatch({ type: 'success', entity, operation });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        mutationDispatch({ type: 'error', entity, operation, error: message });
        throw error;
      }
    },
    [mutationDispatch],
  );

  const addDealer = useCallback(
    (dealer: DealerInput) =>
      runMutation('dealers', 'create', () => apiCreateDealer(dealer), createdDealer => {
        dataDispatch({ type: 'ADD_DEALER', payload: createdDealer });
      }),
    [runMutation, dataDispatch],
  );

  const updateDealer = useCallback(
    (id: string, updates: DealerUpdate) =>
      runMutation('dealers', 'update', () => apiUpdateDealer(id, updates), updatedDealer => {
        dataDispatch({ type: 'UPDATE_DEALER', payload: updatedDealer });
      }),
    [runMutation, dataDispatch],
  );

  const deleteDealer = useCallback(
    (id: string) =>
      runMutation('dealers', 'delete', () => apiDeleteDealer(id), () => {
        dataDispatch({ type: 'DELETE_DEALER', payload: id });
      }),
    [runMutation, dataDispatch],
  );

  const addModel = useCallback(
    (model: ModelInput) =>
      runMutation('models', 'create', () => apiCreateModel(model), createdModel => {
        dataDispatch({ type: 'ADD_MODEL', payload: createdModel });
      }),
    [runMutation, dataDispatch],
  );

  const updateModel = useCallback(
    (id: string, updates: ModelUpdate) =>
      runMutation('models', 'update', () => apiUpdateModel(id, updates), updatedModel => {
        dataDispatch({ type: 'UPDATE_MODEL', payload: updatedModel });
      }),
    [runMutation, dataDispatch],
  );

  const deleteModel = useCallback(
    (id: string) =>
      runMutation('models', 'delete', () => apiDeleteModel(id), () => {
        dataDispatch({ type: 'DELETE_MODEL', payload: id });
      }),
    [runMutation, dataDispatch],
  );

  const addBlogPost = useCallback(
    (post: BlogPostInput) =>
      runMutation('blogPosts', 'create', () => apiCreateBlogPost(post), createdPost => {
        dataDispatch({ type: 'ADD_BLOG_POST', payload: createdPost });
      }),
    [runMutation, dataDispatch],
  );

  const updateBlogPost = useCallback(
    (id: string, updates: BlogPostUpdate) =>
      runMutation('blogPosts', 'update', () => apiUpdateBlogPost(id, updates), updatedPost => {
        dataDispatch({ type: 'UPDATE_BLOG_POST', payload: updatedPost });
      }),
    [runMutation, dataDispatch],
  );

  const deleteBlogPost = useCallback(
    (id: string) =>
      runMutation('blogPosts', 'delete', () => apiDeleteBlogPost(id), () => {
        dataDispatch({ type: 'DELETE_BLOG_POST', payload: id });
      }),
    [runMutation, dataDispatch],
  );

  const { dealers, models, blogPosts, loading, error } = dataState;

  const contextValue = useMemo(
    () => ({
      dealers,
      models,
      blogPosts,
      loading,
      loadError: error,
      dealerMutations: mutationState.dealers,
      modelMutations: mutationState.models,
      blogPostMutations: mutationState.blogPosts,
      addDealer,
      updateDealer,
      deleteDealer,
      addModel,
      updateModel,
      deleteModel,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
    }),
    [
      dealers,
      models,
      blogPosts,
      loading,
      error,
      mutationState.dealers,
      mutationState.models,
      mutationState.blogPosts,
      addDealer,
      updateDealer,
      deleteDealer,
      addModel,
      updateModel,
      deleteModel,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
    ],
  );

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
