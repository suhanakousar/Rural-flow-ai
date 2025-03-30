import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from datetime import datetime, timedelta

from .base_model import BaseModel
from ..utils import generate_time_features, save_model_data

class IrrigationOptimizationModel(BaseModel):
    """ML model for optimizing irrigation schedules based on soil conditions"""
    
    def __init__(self):
        super().__init__("irrigation_optimization", "soil_moisture")
        self.scaler = StandardScaler()
        
    def preprocess(self, data):
        """Transform raw data into features for irrigation optimization"""
        # Select relevant features
        features = ['hour', 'temperature', 'is_day', 'season', 'is_weekend']
        
        # Ensure all required features exist
        for feature in features:
            if feature not in data.columns and feature != 'temperature':
                raise ValueError(f"Required feature '{feature}' not found in data")
                
        # Combine time features with other variables
        X = data[features].copy()
        
        if self.feature_columns is None:
            self.feature_columns = features
            
        # Return features and target if available
        if self.target_column in data.columns:
            y = data[self.target_column]
            return X, y
        return X
    
    def train(self, data):
        """Train the soil moisture prediction model for irrigation"""
        X, y = self.preprocess(data)
        
        # Create and train Gradient Boosting model
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        model.fit(X, y)
        self.model = model
        
        # Calculate performance metrics
        y_pred = model.predict(X)
        mae = mean_absolute_error(y, y_pred)
        mse = mean_squared_error(y, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y, y_pred)
        
        # Update metadata
        self.metadata['performance'] = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2': r2
        }
        self.metadata['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        save_model_data(self.name, self.metadata)
        return self.metadata['performance']
    
    def predict(self, input_data):
        """Predict soil moisture levels based on input conditions"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
            
        # Handle dictionary input
        if isinstance(input_data, dict):
            time_features = {}
            if 'datetime' in input_data:
                dt = datetime.fromisoformat(input_data['datetime'])
                time_features = generate_time_features(dt)
            else:
                # Use current time
                time_features = generate_time_features(datetime.now())
                
            # Combine with other inputs
            input_dict = {**time_features, **input_data}
            
            # Create DataFrame from dict
            input_df = pd.DataFrame([input_dict])
            X = input_df[self.feature_columns]
        else:
            # Process DataFrame input
            X = self.preprocess(input_data)
            
        # Make predictions
        predictions = self.model.predict(X)
        
        # For single predictions, return a scalar
        if len(predictions) == 1:
            return float(predictions[0])
        
        return predictions
    
    def calculate_optimal_irrigation(self, current_soil_moisture, temperature, timestamp=None):
        """Calculate optimal irrigation duration based on current conditions"""
        if timestamp is None:
            timestamp = datetime.now()
            
        # Optimal soil moisture target (45-55%)
        target_moisture = 50
        
        # Current moisture deficit
        moisture_deficit = max(0, target_moisture - current_soil_moisture)
        
        # Base irrigation rate (% moisture increase per minute of irrigation)
        base_rate = 0.8
        
        # Adjust rate based on temperature (higher temp = faster evaporation)
        temp_factor = 1.0 + (temperature - 25) * 0.02 if temperature > 25 else 1.0
        
        # Time of day adjustment (less effective during hot daytime)
        time_features = generate_time_features(timestamp)
        time_factor = 0.8 if time_features['is_day'] and temperature > 28 else 1.2 if not time_features['is_day'] else 1.0
        
        # Season adjustment
        season_factor = 1.2 if time_features['season'] == 2 else 1.0  # More in summer
        
        # Calculate minutes needed to reach target moisture
        irrigation_minutes = moisture_deficit / (base_rate * time_factor * season_factor / temp_factor)
        
        # Future moisture prediction after irrigation
        future_moisture = current_soil_moisture + (irrigation_minutes * base_rate * time_factor * season_factor / temp_factor)
        
        # Round to nearest minute with a minimum of 0
        irrigation_minutes = max(0, round(irrigation_minutes))
        
        # Create irrigation zones (North, East, South)
        zones = []
        
        # Customize for each zone based on their conditions
        # North zone (slightly cooler, more shade)
        north_minutes = max(0, round(irrigation_minutes * 0.9))
        zones.append({
            "id": "zone1",
            "name": "North Field Zone",
            "active": north_minutes > 0,
            "duration": f"{north_minutes} min"
        })
        
        # East zone (more sun exposure)
        east_minutes = max(0, round(irrigation_minutes * 1.1))
        zones.append({
            "id": "zone2",
            "name": "East Field Zone",
            "active": east_minutes > 0,
            "duration": f"{east_minutes} min"
        })
        
        # South zone (standard conditions)
        south_minutes = irrigation_minutes
        zones.append({
            "id": "zone3",
            "name": "South Field Zone",
            "active": south_minutes > 0,
            "duration": f"{south_minutes} min"
        })
        
        # Generate recommendations
        recommendations = [
            f"Optimal irrigation time: {irrigation_minutes} minutes to reach target soil moisture.",
            f"Expected soil moisture after irrigation: {round(future_moisture)}%."
        ]
        
        if temperature > 30:
            recommendations.append("High temperature detected. Consider irrigating during early morning or evening for better efficiency.")
        
        if time_features['season'] == 2:  # Summer
            recommendations.append("Summer season detected. Consider increasing irrigation frequency and monitoring evaporation rates.")
            
        # Generate a single recommendation string
        recommendation = " ".join(recommendations)
        
        return {
            "zones": zones,
            "recommendation": recommendation,
            "moisture_deficit": round(moisture_deficit, 1),
            "current_moisture": round(current_soil_moisture, 1),
            "target_moisture": target_moisture,
            "expected_moisture": round(future_moisture, 1)
        }