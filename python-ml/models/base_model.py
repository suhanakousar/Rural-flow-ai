import os
import json
import pickle
import numpy as np
from datetime import datetime

class BaseModel:
    """Base class for all ML models in the system"""
    
    def __init__(self, name, target_column=None):
        """
        Initialize a base model
        
        Args:
            name: Unique name for the model
            target_column: Name of the target column in the data
        """
        self.name = name
        self.target_column = target_column
        self.model = None
        self.feature_columns = None
        self.metadata = {
            'name': name,
            'target': target_column,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': None,
            'performance': {}
        }
    
    def preprocess(self, data):
        """
        Preprocess data before training or prediction
        
        This method should be overridden by subclasses
        """
        pass
    
    def train(self, data):
        """
        Train the model on the provided data
        
        This method should be overridden by subclasses
        """
        pass
    
    def predict(self, input_data):
        """
        Make predictions using the trained model
        
        This method should be overridden by subclasses
        """
        pass
    
    def save(self):
        """Save the model and its metadata to disk"""
        if self.model is None:
            raise ValueError("Cannot save model that has not been trained")
            
        # Ensure directory exists
        os.makedirs('python-ml/models/saved', exist_ok=True)
        
        # Update metadata
        self.metadata['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Save model using pickle
        model_path = f'python-ml/models/saved/{self.name}_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
            
        # Save feature columns if they exist
        if self.feature_columns is not None:
            self.metadata['feature_columns'] = list(self.feature_columns)
            
        # Save metadata as JSON
        metadata_path = f'python-ml/models/saved/{self.name}_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=2)
            
        return {
            'model_path': model_path,
            'metadata_path': metadata_path
        }
    
    def load(self):
        """Load the model and its metadata from disk"""
        model_path = f'python-ml/models/saved/{self.name}_model.pkl'
        metadata_path = f'python-ml/models/saved/{self.name}_metadata.json'
        
        # Check if files exist
        if not os.path.exists(model_path) or not os.path.exists(metadata_path):
            print(f"Could not find saved model files for {self.name}")
            return False
            
        try:
            # Load model
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
                
            # Load metadata
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
                
            # Restore feature columns if they exist in metadata
            if 'feature_columns' in self.metadata:
                self.feature_columns = self.metadata['feature_columns']
                
            print(f"Successfully loaded model {self.name}")
            return True
            
        except Exception as e:
            print(f"Error loading model {self.name}: {e}")
            return False