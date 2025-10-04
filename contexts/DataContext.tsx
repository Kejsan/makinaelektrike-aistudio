import React, {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import type { Dealer, DealerDocument, Model, BlogPost, DealerModel } from '../types';
import {
  subscribeToDealers,
  subscribeToModels,
  subscribeToBlogPosts,
  subscribeToDealerModels,
  createDealer as apiCreateDealer,
  updateDealer as apiUpdateDealer,
  deleteDealer as apiDeleteDealer,
  createModel as apiCreateModel,
  updateModel as apiUpdateModel,
  deleteModel as apiDeleteModel,
  createBlogPost as apiCreateBlogPost,
  updateBlogPost as apiUpdateBlogPost,
  deleteBlogPost as apiDeleteBlogPost,
  createDealerModel as apiCreateDealerModel,
  deleteDealerModel as apiDeleteDealerModel,
} from '../services/api';
import { useAuth } from './AuthContext';
import type { UserRole } from '../types';
import { useToast } from './ToastContext';
import type { FirestoreError, Unsubscribe } from 'firebase/firestore';

type DealerInput = DealerDocument;
type DealerUpdate = Partial<DealerDocument>;
type ModelInput = Omit<Model, 'id'>;
type ModelUpdate = Partial<Omit<Model, 'id'>>;
type BlogPostInput = Omit<BlogPost, 'id'>;
type BlogPostUpdate = Partial<BlogPost>;

type EntityKey = 'dealers' | 'models' | 'blogPosts';
type Operation = 'create' | 'update' | 'delete';

type MutationFlag = {
  loading: boolean;
  error: string | null;
};

type EntityMutations = Record<Operation, MutationFlag>;

type MutationState = Record<EntityKey, EntityMutations>;

interface DataState {
  dealers: Dealer[];
  models: Model[];
  blogPosts: BlogPost[];
  dealerModels: DealerModel[];
  loadError: string | null;
  loading: boolean;
  loaded: {
    dealers: boolean;
    models: boolean;
    blogPosts: boolean;
    dealerModels: boolean;
  };
}

interface DataContextType {
  dealers: Dealer[];
  models: Model[];
  blogPosts: BlogPost[];
  dealerModels: DealerModel[];
  loading: boolean;
  loadError: string | null;
  dealerMutations: EntityMutations;
  modelMutations: EntityMutations;
  blogPostMutations: EntityMutations;
  getModelsForDealer: (dealerId: string) => Model[];
  getDealersForModel: (modelId: string) => Dealer[];
  addDealer: (dealer: DealerInput) => Promise<Dealer>;
  updateDealer: (id: string, updates: DealerUpdate) => Promise<Dealer>;
  deleteDealer: (id: string) => Promise<void>;
  approveDealer: (id: string) => Promise<Dealer>;
  rejectDealer: (id: string) => Promise<Dealer>;
  addModel: (model: ModelInput) => Promise<Model>;
  updateModel: (id: string, updates: ModelUpdate) => Promise<Model>;
  deleteModel: (id: string) => Promise<void>;
  addBlogPost: (post: BlogPostInput) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: BlogPostUpdate) => Promise<BlogPost>;
  deleteBlogPost: (id: string) => Promise<void>;
  linkModelToDealer: (dealerId: string, modelId: string) => Promise<DealerModel>;
  unlinkModelFromDealer: (dealerId: string, modelId: string) => Promise<{ dealer_id: string; model_id: string }>;
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

type DataAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SET_DEALERS'; payload: Dealer[] }
  | { type: 'SET_MODELS'; payload: Model[] }
  | { type: 'SET_BLOG_POSTS'; payload: BlogPost[] }
  | { type: 'SET_DEALER_MODELS'; payload: DealerModel[] };

const areCollectionsLoaded = (loaded: DataState['loaded']) =>
  loaded.dealers && loaded.models && loaded.blogPosts && loaded.dealerModels;

const mutationReducer = (state: MutationState, action: MutationAction): MutationState => {
  const entityState = state[action.entity];

  switch (action.type) {
    case 'start':
      return {
        ...state,
        [action.entity]: {
          ...entityState,
          [action.operation]: { loading: true, error: null },
        },
      };
    case 'success':
      return {
        ...state,
        [action.entity]: {
          ...entityState,
          [action.operation]: { loading: false, error: null },
        },
      };
    case 'error':
      return {
        ...state,
        [action.entity]: {
          ...entityState,
          [action.operation]: { loading: false, error: action.error },
        },
      };
    default:
      return state;
  }
};

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, loadError: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, loadError: action.payload };
    case 'SET_DEALERS': {
      const loaded = { ...state.loaded, dealers: true };
      return {
        ...state,
        dealers: action.payload,
        loaded,
        loading: !areCollectionsLoaded(loaded),
      };
    }
    case 'SET_MODELS': {
      const loaded = { ...state.loaded, models: true };
      return {
        ...state,
        models: action.payload,
        loaded,
        loading: !areCollectionsLoaded(loaded),
      };
    }
    case 'SET_BLOG_POSTS': {
      const loaded = { ...state.loaded, blogPosts: true };
      return {
        ...state,
        blogPosts: action.payload,
        loaded,
        loading: !areCollectionsLoaded(loaded),
      };
    }
    case 'SET_DEALER_MODELS': {
      const loaded = { ...state.loaded, dealerModels: true };
      return {
        ...state,
        dealerModels: action.payload,
        loaded,
        loading: !areCollectionsLoaded(loaded),
      };
    }
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
  dealerModels: [],
  loading: true,
  loadError: null,
  dealerMutations: defaultMutationState.dealers,
  modelMutations: defaultMutationState.models,
  blogPostMutations: defaultMutationState.blogPosts,
  getModelsForDealer: () => [],
  getDealersForModel: () => [],
  addDealer: rejectUsage as DataContextType['addDealer'],
  updateDealer: rejectUsage as DataContextType['updateDealer'],
  deleteDealer: rejectUsage as DataContextType['deleteDealer'],
  approveDealer: rejectUsage as DataContextType['approveDealer'],
  rejectDealer: rejectUsage as DataContextType['rejectDealer'],
  addModel: rejectUsage as DataContextType['addModel'],
  updateModel: rejectUsage as DataContextType['updateModel'],
  deleteModel: rejectUsage as DataContextType['deleteModel'],
  addBlogPost: rejectUsage as DataContextType['addBlogPost'],
  updateBlogPost: rejectUsage as DataContextType['updateBlogPost'],
  deleteBlogPost: rejectUsage as DataContextType['deleteBlogPost'],
  linkModelToDealer: rejectUsage as DataContextType['linkModelToDealer'],
  unlinkModelFromDealer: rejectUsage as DataContextType['unlinkModelFromDealer'],
});

interface DataProviderProps {
  children: ReactNode;
}

const initialDataState: DataState = {
  dealers: [],
  models: [],
  blogPosts: [],
  dealerModels: [],
  loadError: null,
  loading: true,
  loaded: {
    dealers: false,
    models: false,
    blogPosts: false,
    dealerModels: false,
  },
};

interface MutationRequest<T> {
  entity: EntityKey;
  operation: Operation;
  action: () => Promise<T>;
  successMessage: string;
  errorMessage: string;
  allowedRoles?: UserRole[];
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dataState, dataDispatch] = useReducer(dataReducer, initialDataState);
  const [mutationState, mutationDispatch] = useReducer(mutationReducer, createInitialMutationState());
  const { role } = useAuth();
  const { addToast } = useToast();

  const handleSubscriptionError = useCallback(
    (resource: string) => (error: FirestoreError) => {
      console.error(`Failed to subscribe to ${resource}`, error);
      const message = `Failed to load ${resource}. Please try again later.`;
      dataDispatch({ type: 'LOAD_ERROR', payload: message });
      addToast(message, 'error');
    },
    [addToast],
  );

  useEffect(() => {
    dataDispatch({ type: 'LOAD_START' });

    const unsubscribers: Unsubscribe[] = [
      subscribeToDealers({
        onData: dealers => dataDispatch({ type: 'SET_DEALERS', payload: dealers }),
        onError: handleSubscriptionError('dealers'),
      }),
      subscribeToModels({
        onData: models => dataDispatch({ type: 'SET_MODELS', payload: models }),
        onError: handleSubscriptionError('vehicle models'),
      }),
      subscribeToBlogPosts({
        onData: posts => dataDispatch({ type: 'SET_BLOG_POSTS', payload: posts }),
        onError: handleSubscriptionError('blog posts'),
      }),
      subscribeToDealerModels({
        onData: mappings => dataDispatch({ type: 'SET_DEALER_MODELS', payload: mappings }),
        onError: handleSubscriptionError('dealer relationships'),
      }),
    ];

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [handleSubscriptionError]);

  const runMutation = useCallback(
    async <T,>({
      entity,
      operation,
      action,
      successMessage,
      errorMessage,
      allowedRoles = ['admin'],
    }: MutationRequest<T>) => {
      if (!role || !allowedRoles.includes(role)) {
        const permissionMessage = 'You do not have permission to perform this action.';
        mutationDispatch({ type: 'error', entity, operation, error: permissionMessage });
        addToast(permissionMessage, 'error');
        throw new Error(permissionMessage);
      }

      mutationDispatch({ type: 'start', entity, operation });

      try {
        const result = await action();
        mutationDispatch({ type: 'success', entity, operation });
        addToast(successMessage, 'success');
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        mutationDispatch({ type: 'error', entity, operation, error: message });
        addToast(errorMessage, 'error');
        throw error;
      }
    },
    [addToast, role],
  );

  const addDealer = useCallback(
    (dealer: DealerInput) =>
      runMutation({
        entity: 'dealers',
        operation: 'create',
        action: () => apiCreateDealer(dealer),
        successMessage: 'Dealer created successfully.',
        errorMessage: 'Failed to create dealer.',
      }),
    [runMutation],
  );

  const updateDealer = useCallback(
    (id: string, updates: DealerUpdate) =>
      runMutation({
        entity: 'dealers',
        operation: 'update',
        action: () => apiUpdateDealer(id, updates),
        successMessage: 'Dealer updated successfully.',
        errorMessage: 'Failed to update dealer.',
        allowedRoles: ['admin', 'dealer'],
      }),
    [runMutation],
  );

  const deleteDealer = useCallback(
    (id: string) =>
      runMutation({
        entity: 'dealers',
        operation: 'delete',
        action: () => apiDeleteDealer(id),
        successMessage: 'Dealer deleted successfully.',
        errorMessage: 'Failed to delete dealer.',
      }),
    [runMutation],
  );

  const approveDealer = useCallback(
    (id: string) =>
      runMutation({
        entity: 'dealers',
        operation: 'update',
        action: () => apiUpdateDealer(id, { approved: true }),
        successMessage: 'Dealer approved successfully.',
        errorMessage: 'Failed to approve dealer.',
      }),
    [runMutation],
  );

  const rejectDealer = useCallback(
    (id: string) =>
      runMutation({
        entity: 'dealers',
        operation: 'update',
        action: () => apiUpdateDealer(id, { approved: false }),
        successMessage: 'Dealer rejected successfully.',
        errorMessage: 'Failed to reject dealer.',
      }),
    [runMutation],
  );

  const addModel = useCallback(
    (model: ModelInput) =>
      runMutation({
        entity: 'models',
        operation: 'create',
        action: () => apiCreateModel(model),
        successMessage: 'Model created successfully.',
        errorMessage: 'Failed to create model.',
        allowedRoles: ['admin', 'dealer'],
      }),
    [runMutation],
  );

  const updateModel = useCallback(
    (id: string, updates: ModelUpdate) =>
      runMutation({
        entity: 'models',
        operation: 'update',
        action: () => apiUpdateModel(id, updates),
        successMessage: 'Model updated successfully.',
        errorMessage: 'Failed to update model.',
        allowedRoles: ['admin', 'dealer'],
      }),
    [runMutation],
  );

  const deleteModel = useCallback(
    (id: string) =>
      runMutation({
        entity: 'models',
        operation: 'delete',
        action: () => apiDeleteModel(id),
        successMessage: 'Model deleted successfully.',
        errorMessage: 'Failed to delete model.',
      }),
    [runMutation],
  );

  const linkModelToDealer = useCallback(
    (dealerId: string, modelId: string) =>
      runMutation({
        entity: 'dealers',
        operation: 'update',
        action: () => apiCreateDealerModel(dealerId, modelId),
        successMessage: 'Model linked to dealer successfully.',
        errorMessage: 'Failed to link model to dealer.',
        allowedRoles: ['admin', 'dealer'],
      }),
    [runMutation],
  );

  const unlinkModelFromDealer = useCallback(
    (dealerId: string, modelId: string) =>
      runMutation({
        entity: 'dealers',
        operation: 'update',
        action: async () => {
          await apiDeleteDealerModel(dealerId, modelId);
          return { dealer_id: dealerId, model_id: modelId };
        },
        successMessage: 'Model removed from dealer successfully.',
        errorMessage: 'Failed to remove model from dealer.',
        allowedRoles: ['admin', 'dealer'],
      }),
    [runMutation],
  );

  const addBlogPost = useCallback(
    (post: BlogPostInput) =>
      runMutation({
        entity: 'blogPosts',
        operation: 'create',
        action: () => apiCreateBlogPost(post),
        successMessage: 'Blog post created successfully.',
        errorMessage: 'Failed to create blog post.',
      }),
    [runMutation],
  );

  const updateBlogPost = useCallback(
    (id: string, updates: BlogPostUpdate) =>
      runMutation({
        entity: 'blogPosts',
        operation: 'update',
        action: () => apiUpdateBlogPost(id, updates),
        successMessage: 'Blog post updated successfully.',
        errorMessage: 'Failed to update blog post.',
      }),
    [runMutation],
  );

  const deleteBlogPost = useCallback(
    (id: string) =>
      runMutation({
        entity: 'blogPosts',
        operation: 'delete',
        action: () => apiDeleteBlogPost(id),
        successMessage: 'Blog post deleted successfully.',
        errorMessage: 'Failed to delete blog post.',
      }),
    [runMutation],
  );

  const { dealers, models, blogPosts, dealerModels, loading, loadError } = dataState;

  const dealerToModelMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    dealerModels.forEach(({ dealer_id, model_id }) => {
      if (!map.has(dealer_id)) {
        map.set(dealer_id, new Set());
      }
      map.get(dealer_id)!.add(model_id);
    });
    return map;
  }, [dealerModels]);

  const modelToDealerMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    dealerModels.forEach(({ dealer_id, model_id }) => {
      if (!map.has(model_id)) {
        map.set(model_id, new Set());
      }
      map.get(model_id)!.add(dealer_id);
    });
    return map;
  }, [dealerModels]);

  const getModelsForDealer = useCallback(
    (dealerId: string) => {
      const modelIds = dealerToModelMap.get(dealerId);
      if (!modelIds) {
        return [];
      }
      return models.filter(model => modelIds.has(model.id));
    },
    [dealerToModelMap, models],
  );

  const getDealersForModel = useCallback(
    (modelId: string) => {
      const dealerIds = modelToDealerMap.get(modelId);
      if (!dealerIds) {
        return [];
      }
      return dealers.filter(dealer => dealerIds.has(dealer.id));
    },
    [dealers, modelToDealerMap],
  );

  const contextValue = useMemo(
    () => ({
      dealers,
      models,
      blogPosts,
      dealerModels,
      loading,
      loadError,
      dealerMutations: mutationState.dealers,
      modelMutations: mutationState.models,
      blogPostMutations: mutationState.blogPosts,
      getModelsForDealer,
      getDealersForModel,
      addDealer,
      updateDealer,
      deleteDealer,
      approveDealer,
      rejectDealer,
      addModel,
      updateModel,
      deleteModel,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      linkModelToDealer,
      unlinkModelFromDealer,
    }),
    [
      dealers,
      models,
      blogPosts,
      dealerModels,
      loading,
      loadError,
      mutationState.dealers,
      mutationState.models,
      mutationState.blogPosts,
      getModelsForDealer,
      getDealersForModel,
      addDealer,
      updateDealer,
      deleteDealer,
      approveDealer,
      rejectDealer,
      addModel,
      updateModel,
      deleteModel,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      linkModelToDealer,
      unlinkModelFromDealer,
    ],
  );

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
