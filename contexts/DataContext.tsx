import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { getDealers, getModels, getBlogPosts } from '../services/api';
import { Dealer, Model, BlogPost } from '../types';

interface DataContextType {
  dealers: Dealer[];
  models: Model[];
  blogPosts: BlogPost[];
  loading: boolean;
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

type DealerInput = Omit<Dealer, 'id'>;
type DealerUpdate = Partial<Dealer>;
type ModelInput = Omit<Model, 'id'>;
type ModelUpdate = Partial<Model>;
type BlogPostInput = Omit<BlogPost, 'id'>;
type BlogPostUpdate = Partial<BlogPost>;

const rejectUsage = async () => {
  throw new Error('DataProvider not initialized');
};

export const DataContext = createContext<DataContextType>({
  dealers: [],
  models: [],
  blogPosts: [],
  loading: true,
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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealersData, modelsData, blogPostsData] = await Promise.all([
          getDealers(),
          getModels(),
          getBlogPosts(),
        ]);
        setDealers(dealersData);
        setModels(modelsData);
        setBlogPosts(blogPostsData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addDealer = useCallback(async (dealer: DealerInput) => {
    const newDealer: Dealer = { ...dealer, id: Date.now().toString() };
    setDealers(prev => [...prev, newDealer]);
    return newDealer;
  }, []);

  const updateDealer = useCallback(async (id: string, updates: DealerUpdate) => {
    let updatedDealer: Dealer | null = null;
    setDealers(prev =>
      prev.map(dealer => {
        if (dealer.id === id) {
          updatedDealer = { ...dealer, ...updates };
          return updatedDealer;
        }
        return dealer;
      })
    );

    if (!updatedDealer) {
      throw new Error('Dealer not found');
    }

    return updatedDealer;
  }, []);

  const deleteDealer = useCallback(async (id: string) => {
    let removed = false;
    setDealers(prev =>
      prev.filter(dealer => {
        if (dealer.id === id) {
          removed = true;
          return false;
        }
        return true;
      })
    );

    if (!removed) {
      throw new Error('Dealer not found');
    }
  }, []);

  const addModel = useCallback(async (model: ModelInput) => {
    const newModel: Model = { ...model, id: Date.now().toString() };
    setModels(prev => [...prev, newModel]);
    return newModel;
  }, []);

  const updateModel = useCallback(async (id: string, updates: ModelUpdate) => {
    let updatedModel: Model | null = null;
    setModels(prev =>
      prev.map(model => {
        if (model.id === id) {
          updatedModel = { ...model, ...updates };
          return updatedModel;
        }
        return model;
      })
    );

    if (!updatedModel) {
      throw new Error('Model not found');
    }

    return updatedModel;
  }, []);

  const deleteModel = useCallback(async (id: string) => {
    let removed = false;
    setModels(prev =>
      prev.filter(model => {
        if (model.id === id) {
          removed = true;
          return false;
        }
        return true;
      })
    );

    if (!removed) {
      throw new Error('Model not found');
    }
  }, []);

  const addBlogPost = useCallback(async (post: BlogPostInput) => {
    const newPost: BlogPost = { ...post, id: Date.now().toString() };
    setBlogPosts(prev => [...prev, newPost]);
    return newPost;
  }, []);

  const updateBlogPost = useCallback(async (id: string, updates: BlogPostUpdate) => {
    let updatedPost: BlogPost | null = null;
    setBlogPosts(prev =>
      prev.map(post => {
        if (post.id === id) {
          updatedPost = { ...post, ...updates };
          return updatedPost;
        }
        return post;
      })
    );

    if (!updatedPost) {
      throw new Error('Blog post not found');
    }

    return updatedPost;
  }, []);

  const deleteBlogPost = useCallback(async (id: string) => {
    let removed = false;
    setBlogPosts(prev =>
      prev.filter(post => {
        if (post.id === id) {
          removed = true;
          return false;
        }
        return true;
      })
    );

    if (!removed) {
      throw new Error('Blog post not found');
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      dealers,
      models,
      blogPosts,
      loading,
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
      addDealer,
      updateDealer,
      deleteDealer,
      addModel,
      updateModel,
      deleteModel,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
