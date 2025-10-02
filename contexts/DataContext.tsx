import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getDealers, getModels } from '../services/api';
import { Dealer, Model } from '../types';

interface DataContextType {
  dealers: Dealer[];
  models: Model[];
  loading: boolean;
}

export const DataContext = createContext<DataContextType>({
  dealers: [],
  models: [],
  loading: true,
});

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealersData, modelsData] = await Promise.all([
          getDealers(),
          getModels(),
        ]);
        setDealers(dealersData);
        setModels(modelsData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ dealers, models, loading }}>
      {children}
    </DataContext.Provider>
  );
};
