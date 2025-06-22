// context/DataContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { AggregatedShopkeeper, apiService, CreditReport } from '../services/apiService';

interface DataState {
  shopkeepers: AggregatedShopkeeper[];
  currentShopkeeper: AggregatedShopkeeper | null;
  creditReports: { [key: string]: CreditReport };
  dashboardStats: {
    total_shopkeepers: number;
    average_credit_score: number;
    risk_distribution: { [key: string]: number };
    monthly_trends: Array<{
      month: string;
      total_profit: number;
      total_revenue: number;
      active_shopkeepers: number;
    }>;
  } | null;
  loading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SHOPKEEPERS'; payload: AggregatedShopkeeper[] }
  | { type: 'SET_CURRENT_SHOPKEEPER'; payload: AggregatedShopkeeper | null }
  | { type: 'ADD_SHOPKEEPER'; payload: AggregatedShopkeeper }
  | { type: 'UPDATE_SHOPKEEPER'; payload: AggregatedShopkeeper }
  | { type: 'REMOVE_SHOPKEEPER'; payload: string }
  | { type: 'SET_CREDIT_REPORT'; payload: { id: string; report: CreditReport } }
  | { type: 'SET_DASHBOARD_STATS'; payload: DataState['dashboardStats'] }
  | { type: 'CLEAR_DATA' };

const initialState: DataState = {
  shopkeepers: [],
  currentShopkeeper: null,
  creditReports: {},
  dashboardStats: null,
  loading: false,
  error: null,
};

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SHOPKEEPERS':
      return { ...state, shopkeepers: action.payload, loading: false };
    case 'SET_CURRENT_SHOPKEEPER':
      return { ...state, currentShopkeeper: action.payload };
    case 'ADD_SHOPKEEPER':
      return { 
        ...state, 
        shopkeepers: [...state.shopkeepers, action.payload],
        loading: false 
      };
    case 'UPDATE_SHOPKEEPER':
      return {
        ...state,
        shopkeepers: state.shopkeepers.map(shop =>
          shop.shopkeeper_id === action.payload.shopkeeper_id ? action.payload : shop
        ),
        currentShopkeeper: state.currentShopkeeper?.shopkeeper_id === action.payload.shopkeeper_id 
          ? action.payload 
          : state.currentShopkeeper,
        loading: false
      };
    case 'REMOVE_SHOPKEEPER':
      return {
        ...state,
        shopkeepers: state.shopkeepers.filter(shop => shop.shopkeeper_id !== action.payload),
        currentShopkeeper: state.currentShopkeeper?.shopkeeper_id === action.payload 
          ? null 
          : state.currentShopkeeper,
        loading: false
      };
    case 'SET_CREDIT_REPORT':
      return {
        ...state,
        creditReports: {
          ...state.creditReports,
          [action.payload.id]: action.payload.report
        }
      };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
};

interface DataContextType extends DataState {
  // Shopkeeper management
  fetchShopkeepers: () => Promise<void>;
  fetchShopkeeperById: (id: string) => Promise<void>;
  addShopkeeper: (data: any) => Promise<void>;
  updateShopkeeper: (id: string, data: any) => Promise<void>;
  deleteShopkeeper: (id: string) => Promise<void>;
  setCurrentShopkeeper: (shopkeeper: AggregatedShopkeeper | null) => void;
  
  // Credit reports
  fetchCreditReport: (shopkeeperId: string) => Promise<void>;
  recalculateCreditScores: () => Promise<void>;
  
  // Analytics
  fetchDashboardStats: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleError = useCallback((error: any) => {
    console.error('API Error:', error);
    dispatch({ 
      type: 'SET_ERROR', 
      payload: error.message || 'An unexpected error occurred' 
    });
  }, []);

  const fetchShopkeepers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const shopkeepers = await apiService.getShopkeepers();
      dispatch({ type: 'SET_SHOPKEEPERS', payload: shopkeepers });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const fetchShopkeeperById = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const shopkeeper = await apiService.getShopkeeperById(id);
      dispatch({ type: 'SET_CURRENT_SHOPKEEPER', payload: shopkeeper });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const addShopkeeper = useCallback(async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await apiService.addShopkeeperData(data);
      // Refresh the list after adding
      await fetchShopkeepers();
    } catch (error) {
      handleError(error);
    }
  }, [fetchShopkeepers, handleError]);

  const updateShopkeeper = useCallback(async (id: string, data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await apiService.updateShopkeeperData(id, data);
      // Fetch updated data
      const updatedShopkeeper = await apiService.getShopkeeperById(id);
      dispatch({ type: 'UPDATE_SHOPKEEPER', payload: updatedShopkeeper });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const deleteShopkeeper = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await apiService.deleteShopkeeper(id);
      dispatch({ type: 'REMOVE_SHOPKEEPER', payload: id });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const setCurrentShopkeeper = useCallback((shopkeeper: AggregatedShopkeeper | null) => {
    dispatch({ type: 'SET_CURRENT_SHOPKEEPER', payload: shopkeeper });
  }, []);

  const fetchCreditReport = useCallback(async (shopkeeperId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const report = await apiService.getCreditReport(shopkeeperId);
      dispatch({ 
        type: 'SET_CREDIT_REPORT', 
        payload: { id: shopkeeperId, report } 
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const recalculateCreditScores = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await apiService.recalculateCreditScores();
      // Refresh shopkeepers data after recalculation
      await fetchShopkeepers();
    } catch (error) {
      handleError(error);
    }
  }, [fetchShopkeepers, handleError]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const stats = await apiService.getDashboardStats();
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchShopkeepers(),
      fetchDashboardStats()
    ]);
  }, [fetchShopkeepers, fetchDashboardStats]);

  // Initialize data on mount - only run once and only if not already loaded
  // TEMPORARILY DISABLED TO FIX INFINITE RE-RENDER
  /*
  useEffect(() => {
    if (!isDataLoaded) {
      console.log('Loading initial data...');
      refreshData();
      setIsDataLoaded(true);
    }
  }, [isDataLoaded, refreshData]);
  */
  
  // Simple initialization without circular dependencies
  useEffect(() => {
    if (!isDataLoaded) {
      console.log('Loading initial data...');
      const loadInitialData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          dispatch({ type: 'SET_ERROR', payload: null });
          
          const [shopkeepers, stats] = await Promise.all([
            apiService.getShopkeepers(),
            apiService.getDashboardStats()
          ]);
          
          dispatch({ type: 'SET_SHOPKEEPERS', payload: shopkeepers });
          dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
        } catch (error) {
          console.error('API Error:', error);
          dispatch({ 
            type: 'SET_ERROR', 
            payload: error.message || 'An unexpected error occurred' 
          });
        }
      };
      loadInitialData();
      setIsDataLoaded(true);
    }
  }, [isDataLoaded]);

  const contextValue: DataContextType = {
    ...state,
    fetchShopkeepers,
    fetchShopkeeperById,
    addShopkeeper,
    updateShopkeeper,
    deleteShopkeeper,
    setCurrentShopkeeper,
    fetchCreditReport,
    recalculateCreditScores,
    fetchDashboardStats,
    clearError,
    refreshData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};