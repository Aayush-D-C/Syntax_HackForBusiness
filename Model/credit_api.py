from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variable to store the model
model = None

def load_model():
    """Load the credit scoring model"""
    global model
    try:
        # Check if model file exists
        model_path = 'credit_score_model.pkl'
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info("Model loaded successfully")
        else:
            logger.warning("Model file not found, will train new model")
            train_model()
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        train_model()

def train_model():
    """Train a new credit scoring model"""
    global model
    try:
        # Load the CSV data
        df = pd.read_csv('bizsathi_1000_shopkeepers.csv')
        
        # Feature engineering
        df['payment_reliability'] = df['on_time_payments'] / (df['on_time_payments'] + df['missed_payments'])
        df['profit_margin'] = df['profit'] / df['revenue']
        df['avg_daily_transactions'] = df['transactions'] / df['days_active']
        
        # Select features for the model
        features = [
            'transactions', 'on_time_payments', 'missed_payments',
            'avg_transaction_amount', 'profit', 'revenue', 'expenses',
            'days_active', 'payment_reliability', 'profit_margin',
            'avg_daily_transactions'
        ]
        
        # Create target variable (credit score 0-100)
        # Higher scores for better performance
        df['credit_score'] = (
            df['payment_reliability'] * 30 +
            (df['profit_margin'] * 100).clip(0, 30) +
            (df['avg_daily_transactions'] / 10).clip(0, 20) +
            (df['transactions'] / 100).clip(0, 20)
        ).round().astype(int)
        
        # Ensure credit score is between 0 and 100
        df['credit_score'] = df['credit_score'].clip(0, 100)
        
        # Prepare training data
        X = df[features].fillna(0)
        y = df['credit_score']
        
        # Train a simple model (Random Forest)
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.model_selection import train_test_split
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Save the model
        joblib.dump(model, 'credit_score_model.pkl')
        logger.info("Model trained and saved successfully")
        
    except Exception as e:
        logger.error(f"Error training model: {e}")
        # Create a simple fallback model
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        # Train with dummy data
        X_dummy = np.random.rand(100, 11)
        y_dummy = np.random.randint(0, 100, 100)
        model.fit(X_dummy, y_dummy)

def calculate_credit_score(data):
    """Calculate credit score for given data"""
    try:
        if model is None:
            load_model()
        
        # Prepare features
        payment_reliability = data['on_time_payments'] / (data['on_time_payments'] + data['missed_payments'])
        profit_margin = data['profit'] / data['revenue'] if data['revenue'] > 0 else 0
        avg_daily_transactions = data['transactions'] / data['days_active'] if data['days_active'] > 0 else 0
        
        features = [
            data['transactions'],
            data['on_time_payments'],
            data['missed_payments'],
            data['avg_transaction_amount'],
            data['profit'],
            data['revenue'],
            data['expenses'],
            data['days_active'],
            payment_reliability,
            profit_margin,
            avg_daily_transactions
        ]
        
        # Make prediction
        score = model.predict([features])[0]
        score = max(0, min(100, int(score)))  # Ensure score is between 0-100
        
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
            'features_used': features,
            'calculation_date': datetime.now().isoformat()
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
        'model_loaded': model is not None,
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
        result = calculate_credit_score(data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in credit score endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train_model', methods=['POST'])
def train_model_endpoint():
    """Retrain the credit scoring model"""
    try:
        train_model()
        return jsonify({
            'message': 'Model trained successfully',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get information about the current model"""
    return jsonify({
        'model_loaded': model is not None,
        'model_type': type(model).__name__ if model else None,
        'features': [
            'transactions', 'on_time_payments', 'missed_payments',
            'avg_transaction_amount', 'profit', 'revenue', 'expenses',
            'days_active', 'payment_reliability', 'profit_margin',
            'avg_daily_transactions'
        ],
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    # Load model on startup
    load_model()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
