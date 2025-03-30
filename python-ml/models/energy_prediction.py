import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from datetime import datetime, timedelta

from .base_model import BaseModel
from ..utils import generate_time_features, generate_solar_output

class EnergyPredictionModel(BaseModel):
    """ML model for predicting solar energy production"""
    
    def __init__(self):
        super().__init__("energy_prediction", "solar_output")
        self.scaler = StandardScaler()
        
    def preprocess(self, data):
        """Transform raw data into features for solar output prediction"""
        # Select relevant features
        features = ['hour', 'month', 'is_weekend', 'is_day', 'season']
        
        # Extract features from DataFrame
        if isinstance(data, pd.DataFrame):
            X = data[features].copy()
            
            # Return features and target if available
            if self.target_column in data.columns:
                y = data[self.target_column]
                return X, y
            return X
        else:
            # Generate time features from datetime
            time_features = generate_time_features(data)
            return pd.DataFrame([time_features])[features]
    
    def train(self, data):
        """Train the solar output prediction model"""
        X, y = self.preprocess(data)
        
        # Save feature columns
        self.feature_columns = X.columns
        
        # Create and train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        model.fit(X, y)
        self.model = model
        
        # Calculate performance metrics on training data
        y_pred = model.predict(X)
        mae = mean_absolute_error(y, y_pred)
        mse = mean_squared_error(y, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y, y_pred)
        
        # Update metadata
        self.metadata['performance'] = {
            'mae': float(mae),
            'mse': float(mse),
            'rmse': float(rmse),
            'r2': float(r2)
        }
        self.metadata['feature_importance'] = dict(zip(X.columns, model.feature_importances_.tolist()))
        self.metadata['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return self.metadata['performance']
    
    def predict(self, input_data):
        """Predict solar output based on datetime"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
            
        # Preprocess input
        if isinstance(input_data, datetime):
            X = self.preprocess(input_data)
        else:
            X = input_data
            
        # Make prediction
        prediction = self.model.predict(X)
        
        # For single prediction, return a scalar
        if len(prediction) == 1:
            return float(prediction[0])
            
        return prediction
    
    def predict_next_24h(self, start_time=None):
        """Predict solar output for the next 24 hours"""
        if start_time is None:
            start_time = datetime.now()
            
        # Generate hourly timestamps
        timestamps = [start_time + timedelta(hours=i) for i in range(24)]
        
        # Make predictions for each hour
        predictions = []
        for dt in timestamps:
            # Get time features
            X = self.preprocess(dt)
            
            # Predict solar output
            if self.model is not None:
                output = float(self.model.predict(X)[0])
            else:
                # Fallback to simulation if model not trained
                output = generate_solar_output(dt)
                
            # Format timestamp for return
            hour_str = dt.strftime('%H:%M')
            
            predictions.append({
                'time': hour_str,
                'output': round(output, 2),
                'timestamp': dt.timestamp() * 1000
            })
            
        return predictions
    
    def calculate_daily_profile(self, date=None):
        """Calculate a daily solar production profile"""
        if date is None:
            date = datetime.now().date()
            
        # Start at midnight
        start_time = datetime.combine(date, datetime.min.time())
        
        # Get 24-hour predictions
        hourly_predictions = self.predict_next_24h(start_time)
        
        # Calculate daily statistics
        total_output = sum(p['output'] for p in hourly_predictions)
        peak_output = max(p['output'] for p in hourly_predictions)
        peak_time = next(p['time'] for p in hourly_predictions if p['output'] == peak_output)
        
        # Daylight hours (when output > 0.1)
        daylight_hours = sum(1 for p in hourly_predictions if p['output'] > 0.1)
        
        return {
            'date': date.strftime('%Y-%m-%d'),
            'total_output': round(total_output, 2),
            'peak_output': round(peak_output, 2),
            'peak_time': peak_time,
            'daylight_hours': daylight_hours,
            'hourly_forecast': hourly_predictions
        }