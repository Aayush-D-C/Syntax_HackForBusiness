// services/apiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Determine the correct API base URL based on platform and environment
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development environment - use localhost for all platforms
    return 'http://localhost:3001/api';
  } else {
    // Production environment - replace with your actual production API URL
    return 'https://your-production-api.com/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Mock data for development
const MOCK_SHOPKEEPER: AggregatedShopkeeper = {
  shopkeeper_id: '1',
  name: 'Ram Kumar',
  business_type: 'Grocery Store',
  transactions_per_month: 85,
  on_time_payments: 78,
  missed_payments: 7,
  avg_transaction_amount: 1250,
  days_active: 28,
  monthly_profit_avg: 45000,
  monthly_revenue_avg: 180000,
  monthly_loss_count: 1,
  avg_profit_margin: 0.25,
  avg_expense_ratio: 0.75,
  payment_reliability: 0.92,
  profit_trend: 0.15,
  revenue_trend: 0.08,
  credit_score: 78,
  risk_category: 'Good',
};

const MOCK_DASHBOARD_STATS = {
  total_shopkeepers: 1,
  average_credit_score: 78,
  risk_distribution: {
    'Excellent': 0,
    'Good': 1,
    'Fair': 0,
    'Moderate Risk': 0,
    'High Risk': 0,
  },
  monthly_trends: [
    { month: 'Jan', total_profit: 42000, total_revenue: 165000, active_shopkeepers: 1 },
    { month: 'Feb', total_profit: 43500, total_revenue: 168000, active_shopkeepers: 1 },
    { month: 'Mar', total_profit: 44100, total_revenue: 172000, active_shopkeepers: 1 },
    { month: 'Apr', total_profit: 44800, total_revenue: 175000, active_shopkeepers: 1 },
    { month: 'May', total_profit: 45200, total_revenue: 178000, active_shopkeepers: 1 },
    { month: 'Jun', total_profit: 45000, total_revenue: 180000, active_shopkeepers: 1 },
  ],
};

export interface ShopkeeperData {
  shopkeeper_id: string;
  name: string;
  business_type: string;
  month: number;
  transactions: number;
  on_time_payments: number;
  missed_payments: number;
  avg_transaction_amount: number;
  profit: number;
  revenue: number;
  expenses: number;
  days_active: number;
}

export interface CreditReport {
  shopkeeper_id: string;
  name: string;
  business_type: string;
  credit_score: number;
  risk_category: string;
  key_metrics: {
    avg_monthly_profit: string;
    profit_margin: string;
    payment_reliability: string;
    loss_months: string;
    revenue_trend: string;
    profit_trend: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AggregatedShopkeeper {
  shopkeeper_id: string;
  name: string;
  business_type: string;
  transactions_per_month: number;
  on_time_payments: number;
  missed_payments: number;
  avg_transaction_amount: number;
  days_active: number;
  monthly_profit_avg: number;
  monthly_revenue_avg: number;
  monthly_loss_count: number;
  avg_profit_margin: number;
  avg_expense_ratio: number;
  payment_reliability: number;
  profit_trend: number;
  revenue_trend: number;
  credit_score: number;
  risk_category: string;
}

export interface PredictionInput {
  transactions_per_month: number;
  on_time_payments: number;
  missed_payments: number;
  avg_transaction_amount: number;
  days_active: number;
  monthly_profit_avg: number;
  monthly_revenue_avg: number;
  monthly_loss_count: number;
  avg_profit_margin: number;
  avg_expense_ratio: number;
  payment_reliability: number;
  profit_trend: number;
  revenue_trend: number;
  business_type: string;
}

export interface PredictionResult {
  predicted_risk_category: string;
  probability_scores: {
    [key: string]: number;
  };
  credit_score_estimate: number;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      console.log('Falling back to mock data for endpoint:', endpoint);
      
      // Fallback to mock data for development
      if (__DEV__) {
        return this.getMockData(endpoint);
      }
      
      throw error;
    }
  }

  private getMockData(endpoint: string): any {
    switch (endpoint) {
      case '/shopkeepers':
        return [MOCK_SHOPKEEPER];
      case '/dashboard/stats':
        return MOCK_DASHBOARD_STATS;
      case '/auth/login':
        return {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            name: 'Ram Kumar',
            business_type: 'Grocery Store'
          }
        };
      default:
        if (endpoint.startsWith('/shopkeepers/')) {
          return MOCK_SHOPKEEPER;
        }
        return null;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      });
      
      await AsyncStorage.setItem('authToken', response.token);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
    }
  }

  // Shopkeeper data
  async getShopkeepers(): Promise<AggregatedShopkeeper[]> {
    return await this.makeRequest('/shopkeepers');
  }

  async getShopkeeperById(id: string): Promise<AggregatedShopkeeper> {
    return await this.makeRequest(`/shopkeepers/${id}`);
  }

  async addShopkeeperData(data: ShopkeeperData): Promise<void> {
    await this.makeRequest('/shopkeepers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopkeeperData(id: string, data: Partial<ShopkeeperData>): Promise<void> {
    await this.makeRequest(`/shopkeepers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShopkeeper(id: string): Promise<void> {
    await this.makeRequest(`/shopkeepers/${id}`, {
      method: 'DELETE',
    });
  }

  // Credit reports
  async getCreditReport(shopkeeperId: string): Promise<CreditReport> {
    const shopkeeper = await this.getShopkeeperById(shopkeeperId);
    
    return {
      shopkeeper_id: shopkeeper.shopkeeper_id,
      name: shopkeeper.name,
      business_type: shopkeeper.business_type,
      credit_score: shopkeeper.credit_score,
      risk_category: shopkeeper.risk_category,
      key_metrics: {
        avg_monthly_profit: `NPR ${shopkeeper.monthly_profit_avg.toLocaleString()}`,
        profit_margin: `${shopkeeper.avg_profit_margin.toFixed(1)}%`,
        payment_reliability: `${(shopkeeper.payment_reliability * 100).toFixed(1)}%`,
        loss_months: shopkeeper.monthly_loss_count.toString(),
        revenue_trend: `${(shopkeeper.revenue_trend > 0 ? '+' : '')}${(shopkeeper.revenue_trend * 100).toFixed(1)}%`,
        profit_trend: `${(shopkeeper.profit_trend > 0 ? '+' : '')}${(shopkeeper.profit_trend * 100).toFixed(1)}%`,
      },
      strengths: [
        'Consistent monthly revenue',
        'Good payment reliability',
        'Stable profit margins',
        'Regular business activity'
      ],
      weaknesses: [
        'Some missed payments',
        'Room for profit margin improvement',
        'Limited business expansion'
      ],
      recommendations: [
        'Improve payment collection process',
        'Consider expanding product range',
        'Implement better inventory management',
        'Explore digital payment options'
      ]
    };
  }

  async getAllCreditScores(): Promise<AggregatedShopkeeper[]> {
    return await this.getShopkeepers();
  }

  async recalculateCreditScores(): Promise<void> {
    // This would trigger a recalculation on the backend
    await this.makeRequest('/shopkeepers/recalculate-scores', { method: 'POST' });
  }

  async predictCreditRisk(data: PredictionInput): Promise<PredictionResult> {
    return await this.makeRequest('/predictions/credit-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async predictBusinessPerformance(shopkeeperId: string): Promise<{
    next_month_profit: number;
    next_month_revenue: number;
    growth_probability: number;
  }> {
    return await this.makeRequest(`/predictions/business-performance/${shopkeeperId}`);
  }

  async getDashboardStats(): Promise<{
    total_shopkeepers: number;
    average_credit_score: number;
    risk_distribution: { [key: string]: number };
    monthly_trends: Array<{
      month: string;
      total_profit: number;
      total_revenue: number;
      active_shopkeepers: number;
    }>;
  }> {
    return await this.makeRequest('/dashboard/stats');
  }

  async getBusinessTypeAnalytics(): Promise<{
    [businessType: string]: {
      count: number;
      average_credit_score: number;
      average_profit_margin: number;
      top_performers: string[];
    };
  }> {
    return await this.makeRequest('/analytics/business-types');
  }

  async uploadCSV(file: File): Promise<{ message: string; processed_records: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/csv`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      return {
        message: result.message,
        processed_records: result.processed_records
      };
    } catch (error) {
      console.error('CSV upload failed:', error);
      throw error;
    }
  }

  async exportCreditReports(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/credit-reports`, {
      headers: {
        Authorization: `Bearer ${await this.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.blob();
  }
}

// Export a singleton instance
export const apiService = new ApiService();