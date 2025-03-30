from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys
import json
import traceback

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import utility functions
from utils import generate_synthetic_data, generate_time_features

# Import ML models
from models.energy_prediction import EnergyPredictionModel
from models.water_analysis import WaterLeakDetectionModel
from models.agriculture_optimization import IrrigationOptimizationModel

# Initialize Flask app
app = Flask(__name__)

# Global model instances
energy_model = None
water_model = None
agriculture_model = None

def initialize_models(train=False):
    """Initialize and optionally train all models"""
    global energy_model, water_model, agriculture_model
    
    # Initialize models
    energy_model = EnergyPredictionModel()
    water_model = WaterLeakDetectionModel()
    agriculture_model = IrrigationOptimizationModel()
    
    # Try to load pre-trained models
    energy_loaded = energy_model.load()
    water_loaded = water_model.load()
    agriculture_loaded = agriculture_model.load()
    
    # If any model failed to load or training is requested, train with synthetic data
    if train or not (energy_loaded and water_loaded and agriculture_loaded):
        print("Generating synthetic data and training models...")
        data = generate_synthetic_data(days=90)
        
        if not energy_loaded or train:
            print("Training energy prediction model...")
            energy_model.train(data)
            energy_model.save()
            
        if not water_loaded or train:
            print("Training water leak detection model...")
            water_model.train(data)
            water_model.save()
            
        if not agriculture_loaded or train:
            print("Training irrigation optimization model...")
            agriculture_model.train(data)
            agriculture_model.save()
            
        print("All models trained and saved successfully.")
    else:
        print("All models loaded successfully.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'energy': energy_model is not None,
            'water': water_model is not None,
            'agriculture': agriculture_model is not None
        }
    })

@app.route('/api/energy/predict', methods=['POST'])
def predict_energy():
    """Predict energy production based on time and conditions"""
    try:
        data = request.json
        
        # Handle forecast request
        if data.get('forecast', False):
            # Get start time if provided, otherwise use current time
            start_time = None
            if 'timestamp' in data:
                start_time = datetime.fromtimestamp(data['timestamp'] / 1000)
                
            # Generate 24-hour forecast
            forecast = energy_model.predict_next_24h(start_time)
            return jsonify({
                'success': True,
                'forecast': forecast
            })
        
        # Handle single prediction
        else:
            # Extract timestamp or use current time
            timestamp = data.get('timestamp', datetime.now().timestamp() * 1000)
            dt = datetime.fromtimestamp(timestamp / 1000)
            
            # Make prediction
            prediction = energy_model.predict(dt)
            
            return jsonify({
                'success': True,
                'prediction': {
                    'solar_output': round(prediction, 2),
                    'timestamp': dt.isoformat()
                }
            })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/water/detect-leak', methods=['POST'])
def detect_water_leak():
    """Detect potential water leaks based on usage patterns"""
    try:
        data = request.json
        
        # Get current water usage
        water_usage = data.get('water_usage')
        if water_usage is None:
            return jsonify({
                'success': False,
                'error': 'water_usage parameter is required'
            }), 400
            
        # Extract timestamp or use current time
        timestamp = data.get('timestamp', datetime.now().timestamp() * 1000)
        dt = datetime.fromtimestamp(timestamp / 1000)
        
        # Detect leaks
        result = water_model.detect_leaks_realtime(water_usage, dt)
        
        return jsonify({
            'success': True,
            'result': result
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/agriculture/optimize-irrigation', methods=['POST'])
def optimize_irrigation():
    """Optimize irrigation schedules based on soil conditions"""
    try:
        data = request.json
        
        # Get current soil moisture and temperature
        soil_moisture = data.get('soil_moisture')
        temperature = data.get('temperature')
        
        if soil_moisture is None or temperature is None:
            return jsonify({
                'success': False,
                'error': 'soil_moisture and temperature parameters are required'
            }), 400
            
        # Extract timestamp or use current time
        timestamp = data.get('timestamp', datetime.now().timestamp() * 1000)
        dt = datetime.fromtimestamp(timestamp / 1000)
        
        # Calculate optimal irrigation
        result = agriculture_model.calculate_optimal_irrigation(soil_moisture, temperature, dt)
        
        return jsonify({
            'success': True,
            'result': result
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/train', methods=['POST'])
def train_models():
    """Force retraining of all models"""
    try:
        initialize_models(train=True)
        return jsonify({
            'success': True,
            'message': 'All models trained successfully'
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Initialize models on startup
@app.before_first_request
def before_first_request():
    """Initialize models before first request"""
    initialize_models()

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('python-ml/models/saved', exist_ok=True)
    os.makedirs('python-ml/data', exist_ok=True)
    
    # Initialize models at startup
    initialize_models()
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5001, debug=True)