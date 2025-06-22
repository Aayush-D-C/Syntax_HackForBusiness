export interface CreditScoreData {
  transactions: number;
  on_time_payments: number;
  missed_payments: number;
  avg_transaction_amount: number;
  profit: number;
  revenue: number;
  expenses: number;
  days_active: number;
}

export interface CreditScoreResult {
  credit_score: number;
  risk_category: string;
  calculation_date: string;
  metrics_used?: {
    payment_reliability: number;
    profit_margin: number;
    transaction_volume: number;
    avg_daily_transactions: number;
  };
  error?: string;
}

export interface CreditScoreBreakdown {
  payment_reliability_score: number;
  profit_margin_score: number;
  transaction_volume_score: number;
  daily_consistency_score: number;
  profit_trend_score: number;
  total_score: number;
}

class CreditScoreService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = 'http://localhost:5000'; // Credit score API
  }

  /**
   * Calculate credit score using simple mathematical formulas (client-side)
   */
  calculateCreditScoreSimple(data: CreditScoreData): CreditScoreResult {
    try {
      // Extract data
      const {
        transactions,
        on_time_payments,
        missed_payments,
        avg_transaction_amount,
        profit,
        revenue,
        expenses,
        days_active
      } = data;

      // Calculate derived metrics
      const total_payments = on_time_payments + missed_payments;
      const payment_reliability = total_payments > 0 ? on_time_payments / total_payments : 0;
      const profit_margin = revenue > 0 ? profit / revenue : 0;
      const avg_daily_transactions = days_active > 0 ? transactions / days_active : 0;

      // Calculate credit score (0-100)
      let score = 0;

      // Payment reliability (30 points)
      score += payment_reliability * 30;

      // Profit margin (25 points)
      score += Math.min(profit_margin * 100, 25);

      // Transaction volume (20 points)
      score += Math.min(transactions / 10, 20);

      // Daily transaction consistency (15 points)
      score += Math.min(avg_daily_transactions / 5, 15);

      // Profit trend (10 points)
      if (profit > 0) {
        score += 10;
      }

      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, Math.round(score)));

      // Determine risk category
      let risk_category: string;
      if (score >= 80) {
        risk_category = "Excellent";
      } else if (score >= 60) {
        risk_category = "Good";
      } else if (score >= 40) {
        risk_category = "Fair";
      } else if (score >= 20) {
        risk_category = "Moderate Risk";
      } else {
        risk_category = "High Risk";
      }

      return {
        credit_score: score,
        risk_category,
        calculation_date: new Date().toISOString(),
        metrics_used: {
          payment_reliability,
          profit_margin,
          transaction_volume: transactions,
          avg_daily_transactions
        }
      };

    } catch (error) {
      return {
        credit_score: 50,
        risk_category: 'Fair',
        error: error instanceof Error ? error.message : 'Unknown error',
        calculation_date: new Date().toISOString()
      };
    }
  }

  /**
   * Get detailed breakdown of credit score calculation
   */
  getCreditScoreBreakdown(data: CreditScoreData): CreditScoreBreakdown {
    const {
      transactions,
      on_time_payments,
      missed_payments,
      profit,
      revenue,
      days_active
    } = data;

    // Calculate derived metrics
    const total_payments = on_time_payments + missed_payments;
    const payment_reliability = total_payments > 0 ? on_time_payments / total_payments : 0;
    const profit_margin = revenue > 0 ? profit / revenue : 0;
    const avg_daily_transactions = days_active > 0 ? transactions / days_active : 0;

    // Calculate individual scores
    const payment_reliability_score = payment_reliability * 30;
    const profit_margin_score = Math.min(profit_margin * 100, 25);
    const transaction_volume_score = Math.min(transactions / 10, 20);
    const daily_consistency_score = Math.min(avg_daily_transactions / 5, 15);
    const profit_trend_score = profit > 0 ? 10 : 0;

    const total_score = Math.max(0, Math.min(100, Math.round(
      payment_reliability_score + profit_margin_score + transaction_volume_score + 
      daily_consistency_score + profit_trend_score
    )));

    return {
      payment_reliability_score: Math.round(payment_reliability_score),
      profit_margin_score: Math.round(profit_margin_score),
      transaction_volume_score: Math.round(transaction_volume_score),
      daily_consistency_score: Math.round(daily_consistency_score),
      profit_trend_score: Math.round(profit_trend_score),
      total_score
    };
  }

  /**
   * Calculate credit score using API (server-side)
   */
  async calculateCreditScoreAPI(data: CreditScoreData): Promise<CreditScoreResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/calculate_credit_score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling credit score API:', error);
      // Fallback to client-side calculation
      return this.calculateCreditScoreSimple(data);
    }
  }

  /**
   * Get credit score recommendations based on score
   */
  getRecommendations(score: number): string[] {
    if (score >= 80) {
      return [
        "Maintain your excellent payment history",
        "Consider expanding your business operations",
        "You're eligible for higher credit limits",
        "Focus on maintaining high profit margins"
      ];
    } else if (score >= 60) {
      return [
        "Increase your monthly transactions",
        "Ensure timely payments",
        "Consider diversifying your product range",
        "Work on improving profit margins"
      ];
    } else if (score >= 40) {
      return [
        "Focus on increasing monthly revenue",
        "Improve payment reliability",
        "Consider reducing expenses",
        "Build consistent transaction history"
      ];
    } else {
      return [
        "Prioritize on-time payments",
        "Focus on increasing daily transactions",
        "Work on improving profit margins",
        "Consider business optimization strategies",
        "Build a consistent transaction history"
      ];
    }
  }

  /**
   * Get strengths based on credit score data
   */
  getStrengths(data: CreditScoreData): string[] {
    const strengths: string[] = [];
    const breakdown = this.getCreditScoreBreakdown(data);

    if (breakdown.payment_reliability_score >= 25) {
      strengths.push("Excellent payment reliability");
    }
    if (breakdown.profit_margin_score >= 20) {
      strengths.push("Strong profit margins");
    }
    if (breakdown.transaction_volume_score >= 15) {
      strengths.push("High transaction volume");
    }
    if (breakdown.daily_consistency_score >= 10) {
      strengths.push("Consistent daily activity");
    }
    if (breakdown.profit_trend_score >= 8) {
      strengths.push("Positive profit trend");
    }

    return strengths.length > 0 ? strengths : ["Building credit history"];
  }

  /**
   * Get areas for improvement based on credit score data
   */
  getWeaknesses(data: CreditScoreData): string[] {
    const weaknesses: string[] = [];
    const breakdown = this.getCreditScoreBreakdown(data);

    if (breakdown.payment_reliability_score < 20) {
      weaknesses.push("Improve payment reliability");
    }
    if (breakdown.profit_margin_score < 15) {
      weaknesses.push("Work on profit margins");
    }
    if (breakdown.transaction_volume_score < 10) {
      weaknesses.push("Increase transaction volume");
    }
    if (breakdown.daily_consistency_score < 8) {
      weaknesses.push("Improve daily consistency");
    }
    if (breakdown.profit_trend_score < 5) {
      weaknesses.push("Focus on profitability");
    }

    return weaknesses.length > 0 ? weaknesses : ["Continue building business metrics"];
  }

  /**
   * Generate sample credit score data for testing
   */
  generateSampleData(): CreditScoreData {
    return {
      transactions: Math.floor(Math.random() * 100) + 20,
      on_time_payments: Math.floor(Math.random() * 80) + 10,
      missed_payments: Math.floor(Math.random() * 10),
      avg_transaction_amount: Math.floor(Math.random() * 2000) + 500,
      profit: Math.floor(Math.random() * 50000) + 10000,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      expenses: Math.floor(Math.random() * 80000) + 30000,
      days_active: Math.floor(Math.random() * 30) + 15
    };
  }
}

export const creditScoreService = new CreditScoreService();
