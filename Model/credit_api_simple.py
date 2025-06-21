from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import math
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def calculate_credit_score_simple(data):
    """Calculate credit score using simple mathematical formulas"""
    try:
        # Extract data
        transactions = data.get('transactions', 0)
        on_time_payments = data.get('on_time_payments', 0)
        missed_payments = data.get('missed_payments', 0)
        avg_transaction_amount = data.get('avg_transaction_amount', 0)
        profit = data.get('profit', 0)
        revenue = data.get('revenue', 0)
        expenses = data.get('expenses', 0)
        days_active = data.get('days_active', 0)
        
        # Calculate derived metrics
        total_payments = on_time_payments + missed_payments
        payment_reliability = on_time_payments / total_payments if total_payments > 0 else 0
        profit_margin = profit / revenue if revenue > 0 else 0
        avg_daily_transactions = transactions / days_active if days_active > 0 else 0
        
        # Calculate credit score (0-100)
        score = 0
        
        # Payment reliability (30 points)
        score += payment_reliability * 30
        
        # Profit margin (25 points)
        score += min(profit_margin * 100, 25)
        
        # Transaction volume (20 points)
        score += min(transactions / 10, 20)
        
        # Daily transaction consistency (15 points)
        score += min(avg_daily_transactions / 5, 15)
        
        # Profit trend (10 points)
        if profit > 0:
            score += 10
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, int(score)))
        
        # Determine risk category
        if score >= 80:
            risk_category = "Excellent"
        elif score >= 60:
            risk_category = "Good"
        elif score >= 40:
            risk_category = "Fair"
        elif score >= 20:
            risk_category = "Moderate Risk"
        else:
            risk_category = "High Risk"
        
        return {
            'credit_score': score,
            'risk_category': risk_category,
            'calculation_date': datetime.now().isoformat(),
            'metrics_used': {
                'payment_reliability': payment_reliability,
                'profit_margin': profit_margin,
                'transaction_volume': transactions,
                'avg_daily_transactions': avg_daily_transactions
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating credit score: {e}")
        return {
            'credit_score': 50,
            'risk_category': 'Fair',
            'error': str(e),
            'calculation_date': datetime.now().isoformat()
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Simple Credit Score API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/calculate_credit_score', methods=['POST'])
def credit_score_endpoint():
    """Calculate credit score for shopkeeper data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = [
            'transactions', 'on_time_payments', 'missed_payments',
            'avg_transaction_amount', 'profit', 'revenue', 'expenses', 'days_active'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Calculate credit score
        result = calculate_credit_score_simple(data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in credit score endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint with sample data"""
    sample_data = {
        'transactions': 85,
        'on_time_payments': 78,
        'missed_payments': 7,
        'avg_transaction_amount': 1250,
        'profit': 45000,
        'revenue': 180000,
        'expenses': 135000,
        'days_active': 28
    }
    
    result = calculate_credit_score_simple(sample_data)
    return jsonify({
        'sample_data': sample_data,
        'result': result
    })

if __name__ == '__main__':
    logger.info("Starting Simple Credit Score API...")
    app.run(host='0.0.0.0', port=5000, debug=True) 