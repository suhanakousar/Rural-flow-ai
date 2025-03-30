import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

from .base_model import BaseModel
from ..utils import generate_time_features, save_model_data

class WaterLeakDetectionModel(BaseModel):
    """Anomaly detection model for identifying potential water leaks"""
    
    def __init__(self):
        super().__init__("water_leak_detection", "water_usage")
        self.scaler = StandardScaler()
        
    def preprocess(self, data):
        """Transform raw data into features for anomaly detection"""
        # Select relevant features
        features = ['water_usage', 'hour', 'is_weekend', 'is_day']
        
        if 'water_usage' not in data.columns:
            raise ValueError("Required feature 'water_usage' not found in data")
            
        # Extract features from DataFrame
        X = data[features].copy()
        
        # Scale numeric features
        if self.feature_columns is None:
            self.feature_columns = features
            self.scaler.fit(X[['water_usage']])
            
        X['water_usage_scaled'] = self.scaler.transform(X[['water_usage']])
            
        return X
    
    def train(self, data):
        """Train the anomaly detection model"""
        X = self.preprocess(data)
        
        # Create and train Isolation Forest model for anomaly detection
        model = IsolationForest(
            n_estimators=100,
            contamination=0.05,  # Assume 5% of data points are anomalies
            random_state=42
        )
        
        model.fit(X[['water_usage_scaled', 'hour', 'is_weekend', 'is_day']])
        self.model = model
        
        # Calculate performance on training data
        anomaly_scores = model.decision_function(X[['water_usage_scaled', 'hour', 'is_weekend', 'is_day']])
        predictions = model.predict(X[['water_usage_scaled', 'hour', 'is_weekend', 'is_day']])
        
        # Count anomalies detected
        anomalies_count = (predictions == -1).sum()
        
        # Update metadata
        self.metadata['performance'] = {
            'anomalies_detected': int(anomalies_count),
            'anomaly_rate': float(anomalies_count / len(X)),
            'avg_anomaly_score': float(np.mean(anomaly_scores)),
            'min_anomaly_score': float(np.min(anomaly_scores)),
        }
        self.metadata['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        save_model_data(self.name, self.metadata)
        return self.metadata['performance']
    
    def predict(self, input_data):
        """Predict anomalies in water usage data"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
            
        # Process input data
        if isinstance(input_data, dict):
            # Handle single input as dictionary
            if 'water_usage' not in input_data:
                raise ValueError("Required feature 'water_usage' not found in input")
                
            if 'hour' not in input_data and 'datetime' not in input_data:
                # Use current time if not provided
                dt = datetime.now()
                time_features = generate_time_features(dt)
                input_data.update(time_features)
                
            # Create DataFrame from dict
            input_df = pd.DataFrame([input_data])
        else:
            # Use provided DataFrame
            input_df = input_data.copy()
            
        # Preprocess data
        X = self.preprocess(input_df)
        
        # Get anomaly scores and predictions
        anomaly_scores = self.model.decision_function(X[['water_usage_scaled', 'hour', 'is_weekend', 'is_day']])
        predictions = self.model.predict(X[['water_usage_scaled', 'hour', 'is_weekend', 'is_day']])
        
        # Create result with predictions and scores
        results = []
        for i in range(len(X)):
            results.append({
                'is_anomaly': predictions[i] == -1,
                'anomaly_score': float(anomaly_scores[i]),
                'confidence': min(100, max(0, (0.5 - anomaly_scores[i]) * 100)) if anomaly_scores[i] < 0 else 0,
                'water_usage': float(X.iloc[i]['water_usage'])
            })
            
        # Return single result for single input
        if len(results) == 1:
            return results[0]
            
        return results
    
    def detect_leaks_realtime(self, current_usage, time=None):
        """Detect potential leaks based on current water usage data"""
        if time is None:
            time = datetime.now()
            
        # Generate inputs for anomaly detection
        input_data = {
            'water_usage': current_usage,
            **generate_time_features(time)
        }
        
        # Get prediction
        result = self.predict(input_data)
        
        # Add context to the prediction
        if result['is_anomaly']:
            leak_confidence = result['confidence']
            return {
                'leak_detected': True,
                'confidence': leak_confidence,
                'severity': 'high' if leak_confidence > 80 else 'medium' if leak_confidence > 50 else 'low',
                'recommendation': 'Immediate investigation required' if leak_confidence > 80 else 'Schedule inspection in 24 hours',
                'anomaly_details': result
            }
        
        return {
            'leak_detected': False,
            'confidence': 100 - result['confidence'],
            'status': 'normal',
            'anomaly_details': result
        }