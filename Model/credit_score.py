import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.calibration import CalibratedClassifierCV
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import linregress

# Load the dataset
df = pd.read_csv('bizsathi_1000_shopkeepers.csv')

# Feature Engineering and Aggregation
def aggregate_shopkeeper_data(df):
    aggregated = []
    
    for shop_id, group in df.groupby('shopkeeper_id'):
        group = group.sort_values('month')
        
        # Basic info
        name = group['name'].iloc[0]
        business_type = group['business_type'].iloc[0]
        
        # Transaction metrics
        transactions_per_month = group['transactions'].mean()
        on_time_payments = group['on_time_payments'].sum()
        missed_payments = group['missed_payments'].sum()
        avg_transaction_amount = group['avg_transaction_amount'].mean()
        
        # Financial metrics
        monthly_profit_avg = group['profit'].mean()
        monthly_revenue_avg = group['revenue'].mean()
        monthly_loss_count = (group['profit'] < 0).sum()
        avg_profit_margin = (group['profit'] / group['revenue']).mean() * 100
        avg_expense_ratio = (group['expenses'] / group['revenue']).mean() * 100
        payment_reliability = group['on_time_payments'].sum() / group['transactions'].sum() * 100
        
        # Trend analysis
        if len(group) > 1:
            # Profit trend
            profit_slope, _, _, _, _ = linregress(range(len(group)), group['profit'])
            profit_trend = profit_slope * len(group) / abs(group['profit'].iloc[0]) * 100 if group['profit'].iloc[0] != 0 else 0
            
            # Revenue trend
            revenue_slope, _, _, _, _ = linregress(range(len(group)), group['revenue'])
            revenue_trend = revenue_slope * len(group) / abs(group['revenue'].iloc[0]) * 100 if group['revenue'].iloc[0] != 0 else 0
        else:
            profit_trend = revenue_trend = 0
        
        # Days active
        days_active = group['days_active'].sum()
        
        # Add to aggregated data
        aggregated.append({
            'shopkeeper_id': shop_id,
            'name': name,
            'business_type': business_type,
            'transactions_per_month': transactions_per_month,
            'on_time_payments': on_time_payments,
            'missed_payments': missed_payments,
            'avg_transaction_amount': avg_transaction_amount,
            'days_active': days_active,
            'monthly_profit_avg': monthly_profit_avg,
            'monthly_revenue_avg': monthly_revenue_avg,
            'monthly_loss_count': monthly_loss_count,
            'avg_profit_margin': avg_profit_margin,
            'avg_expense_ratio': avg_expense_ratio,
            'payment_reliability': payment_reliability,
            'profit_trend': profit_trend,
            'revenue_trend': revenue_trend
        })
    
    return pd.DataFrame(aggregated)

# Create aggregated dataset
print("🔢 Aggregating shopkeeper data...")
aggregated_df = aggregate_shopkeeper_data(df)

# Credit scoring function
def calculate_credit_score(row):
    """Calculate credit score based on financial metrics"""
    # Payment behavior (40% weight)
    payment_score = min(100, max(0, 
        (row['on_time_payments'] / (row['on_time_payments'] + row['missed_payments'] + 1e-6)) * 100 * 0.4
    ))
    
    # Profitability (30% weight)
    profit_score = min(100, max(0,
        (min(30, row['avg_profit_margin']) / 30 * 100 * 0.15) +  # Profit margin
        (min(15, max(0, row['profit_trend'])) / 15 * 100 * 0.15  # Profit trend
    )))
    
    # Business health (20% weight)
    health_score = min(100, max(0,
        (1 - (row['monthly_loss_count'] / 6)) * 100 * 0.10 +  # Loss months
        (1 - min(1, row['avg_expense_ratio'] / 100)) * 100 * 0.10  # Expense ratio
    ))
    
    # Activity level (10% weight)
    activity_score = min(100, max(0,
        min(1, row['transactions_per_month'] / 100) * 100 * 0.05 +  # Transaction volume
        min(1, row['days_active'] / 180) * 100 * 0.05  # Days active
    ))
    
    # Total score (0-100)
    total_score = payment_score + profit_score + health_score + activity_score
    
    # Risk category
    if total_score >= 80:
        risk_category = 'Excellent'
    elif total_score >= 70:
        risk_category = 'Good'
    elif total_score >= 60:
        risk_category = 'Fair'
    elif total_score >= 50:
        risk_category = 'Moderate Risk'
    else:
        risk_category = 'High Risk'
    
    return total_score, risk_category

# Calculate credit scores
print("🧮 Calculating credit scores...")
aggregated_df['credit_score'], aggregated_df['risk_category'] = zip(
    *aggregated_df.apply(calculate_credit_score, axis=1)
)

# Save results
aggregated_df.to_csv('shopkeeper_credit_scores.csv', index=False)
print("💾 Saved credit scores to 'shopkeeper_credit_scores.csv'")

# Train a machine learning model to predict creditworthiness
def train_credit_model(aggregated_df):
    """Train a credit risk prediction model"""
    # Encode business type
    le_business = LabelEncoder()
    df = aggregated_df.copy()
    df['business_type_encoded'] = le_business.fit_transform(df['business_type'])
    
    # Features and target
    features = [
        'transactions_per_month', 'on_time_payments', 'missed_payments',
        'avg_transaction_amount', 'days_active', 'monthly_profit_avg',
        'monthly_revenue_avg', 'monthly_loss_count', 'avg_profit_margin',
        'avg_expense_ratio', 'payment_reliability', 'profit_trend',
        'revenue_trend', 'business_type_encoded'
    ]
    
    X = df[features]
    y = df['risk_category']
    
    # Train model
    model = GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=42)
    model.fit(X, y)
    
    # Calibrate for probability estimates
    calibrated_model = CalibratedClassifierCV(model, cv=3)
    calibrated_model.fit(X, y)
    
    # Save model and encoder
    joblib.dump(calibrated_model, 'credit_risk_model.pkl')
    joblib.dump(le_business, 'business_encoder.pkl')
    
    return calibrated_model, le_business

print("\n🤖 Training credit risk model...")
model, le_business = train_credit_model(aggregated_df)
print("✅ Model trained and saved!")

# Visualization: Credit Score Distribution
plt.figure(figsize=(12, 6))
sns.histplot(aggregated_df['credit_score'], bins=20, kde=True)
plt.title('Credit Score Distribution Across Shopkeepers')
plt.xlabel('Credit Score')
plt.ylabel('Number of Shopkeepers')
plt.axvline(50, color='r', linestyle='--', alpha=0.5, label='Risk Threshold')
plt.legend()
plt.tight_layout()
plt.savefig('credit_score_distribution.png')
plt.show()

# Function to get credit report for individual shopkeeper
def get_credit_report(shopkeeper_id):
    """Generate comprehensive credit report for a shopkeeper"""
    # Get shopkeeper data
    shop_data = aggregated_df[aggregated_df['shopkeeper_id'] == shopkeeper_id].iloc[0]
    raw_data = df[df['shopkeeper_id'] == shopkeeper_id]
    
    # Prepare report
    report = {
        'shopkeeper_id': shopkeeper_id,
        'name': shop_data['name'],
        'business_type': shop_data['business_type'],
        'credit_score': shop_data['credit_score'],
        'risk_category': shop_data['risk_category'],
        'key_metrics': {
            'avg_monthly_profit': f"NPR {shop_data['monthly_profit_avg']:,.0f}",
            'profit_margin': f"{shop_data['avg_profit_margin']:.1f}%",
            'payment_reliability': f"{shop_data['payment_reliability']:.1f}%",
            'loss_months': f"{shop_data['monthly_loss_count']}/6 months",
            'revenue_trend': f"{shop_data['revenue_trend']:.1f}%",
            'profit_trend': f"{shop_data['profit_trend']:.1f}%"
        },
        'strengths': [],
        'weaknesses': [],
        'recommendations': []
    }
    
    # Identify strengths
    if shop_data['payment_reliability'] > 90:
        report['strengths'].append("Excellent payment reliability")
    if shop_data['avg_profit_margin'] > 25:
        report['strengths'].append("High profit margins")
    if shop_data['profit_trend'] > 10:
        report['strengths'].append("Strong profit growth trend")
    if shop_data['monthly_loss_count'] == 0:
        report['strengths'].append("No loss months in last 6 months")
    
    # Identify weaknesses
    if shop_data['payment_reliability'] < 80:
        report['weaknesses'].append(f"Payment reliability needs improvement (currently {shop_data['payment_reliability']:.1f}%)")
    if shop_data['avg_profit_margin'] < 15:
        report['weaknesses'].append(f"Low profit margins (currently {shop_data['avg_profit_margin']:.1f}%)")
    if shop_data['profit_trend'] < 0:
        report['weaknesses'].append(f"Declining profits (trend: {shop_data['profit_trend']:.1f}%)")
    if shop_data['monthly_loss_count'] >= 2:
        report['weaknesses'].append(f"Multiple loss months ({shop_data['monthly_loss_count']}/6 months)")
    
    # Generate recommendations
    if shop_data['payment_reliability'] < 90:
        report['recommendations'].append("Improve payment reliability by prioritizing on-time payments")
    if shop_data['avg_expense_ratio'] > 80:
        report['recommendations'].append(f"Reduce expenses (currently {shop_data['avg_expense_ratio']:.1f}% of revenue)")
    if shop_data['profit_trend'] < 5:
        report['recommendations'].append("Develop strategies to improve profit growth")
    if shop_data['monthly_loss_count'] > 0:
        report['recommendations'].append("Analyze loss months to prevent recurrence")
    
    # Business-type specific recommendations
    if shop_data['business_type'] == 'Retail':
        report['recommendations'].append("Optimize inventory to reduce holding costs")
    elif shop_data['business_type'] == 'Service':
        report['recommendations'].append("Focus on customer retention for steady income")
    elif shop_data['business_type'] == 'Agriculture':
        report['recommendations'].append("Explore seasonal diversification opportunities")
    
    # Generate trend visualization
    plt.figure(figsize=(12, 8))
    plt.plot(raw_data['month'], raw_data['profit'], 'o-', label='Profit', color='#4CAF50')
    plt.plot(raw_data['month'], raw_data['revenue'], 'o-', label='Revenue', color='#2196F3')
    plt.bar(raw_data['month'], raw_data['transactions'], alpha=0.3, label='Transactions', color='#9C27B0')
    plt.title(f"Financial Trends: {shop_data['name']}", fontsize=16)
    plt.xlabel('Month')
    plt.ylabel('Amount (NPR) / Transactions')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.3)
    plt.tight_layout()
    plt.savefig(f'shopkeeper_{shopkeeper_id}_trends.png')
    
    return report

# Example: Get credit report for a random shopkeeper
import random
random_shop_id = random.choice(aggregated_df['shopkeeper_id'].tolist())
report = get_credit_report(random_shop_id)

print("\n📊 Sample Credit Report:")
print(f"Shopkeeper: {report['name']} ({report['business_type']})")
print(f"Credit Score: {report['credit_score']:.1f} - {report['risk_category']}")
print("\nKey Metrics:")
for metric, value in report['key_metrics'].items():
    print(f"- {metric.replace('_', ' ').title()}: {value}")

print("\nStrengths:")
for strength in report['strengths']:
    print(f"- {strength}")

print("\nWeaknesses:")
for weakness in report['weaknesses']:
    print(f"- {weakness}")

print("\nRecommendations:")
for i, rec in enumerate(report['recommendations'], 1):
    print(f"{i}. {rec}")