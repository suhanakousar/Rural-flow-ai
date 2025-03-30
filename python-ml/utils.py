import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def save_model_data(model_name, data):
    """Save model metadata to a file"""
    os.makedirs('python-ml/models/saved', exist_ok=True)
    
    # Save metadata to a JSON file
    with open(f'python-ml/models/saved/{model_name}_metadata.json', 'w') as f:
        json.dump(data, f, indent=2)

def generate_time_features(dt):
    """Generate time-based features from a datetime object"""
    hour = dt.hour
    month = dt.month
    day_of_week = dt.weekday()  # 0=Monday, 6=Sunday
    
    # Derive additional features
    is_weekend = 1 if day_of_week >= 5 else 0  # 5=Saturday, 6=Sunday
    is_day = 1 if 6 <= hour < 18 else 0
    
    # Season: 0=Winter, 1=Spring, 2=Summer, 3=Fall
    if month in [12, 1, 2]:
        season = 0
    elif month in [3, 4, 5]:
        season = 1
    elif month in [6, 7, 8]:
        season = 2
    else:
        season = 3
        
    return {
        'hour': hour,
        'month': month,
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'is_day': is_day,
        'season': season
    }

def generate_solar_output(dt, noise=0.1):
    """Generate realistic solar output based on time of day, season, and weather"""
    time_features = generate_time_features(dt)
    hour = time_features['hour']
    season = time_features['season']
    
    # Base solar curve: peaks at noon
    if 6 <= hour <= 18:  # Daylight hours
        # Bell curve centered at noon
        hour_factor = 1.0 - abs(hour - 12) / 6
        
        # Season factor: highest in summer, lowest in winter
        season_factor = [0.4, 0.8, 1.0, 0.6][season]
        
        # Random weather factor (cloudy vs sunny)
        weather_factor = random.uniform(0.5, 1.0)
        
        # Combine factors with some noise
        base_output = hour_factor * season_factor * weather_factor
        noise_factor = random.uniform(1 - noise, 1 + noise)
        
        # Scale to 0-10 kW range
        return min(10.0, max(0.0, base_output * 10 * noise_factor))
    else:
        # No output at night
        return 0.0

def generate_water_usage(dt, noise=0.2):
    """Generate realistic water usage based on time of day and day of week"""
    time_features = generate_time_features(dt)
    hour = time_features['hour']
    is_weekend = time_features['is_weekend']
    
    # Base pattern: more usage in mornings and evenings
    if 5 <= hour <= 9:  # Morning peak
        base_usage = random.uniform(60, 80)
    elif 17 <= hour <= 22:  # Evening peak
        base_usage = random.uniform(70, 90)
    elif 23 <= hour or hour <= 4:  # Night (low usage)
        base_usage = random.uniform(10, 20)
    else:  # Midday
        base_usage = random.uniform(30, 50)
        
    # Weekend factor: typically higher on weekends
    if is_weekend:
        base_usage *= random.uniform(1.1, 1.3)
        
    # Add some noise
    noise_factor = random.uniform(1 - noise, 1 + noise)
    
    # Return as percentage of capacity (0-100%)
    return min(100.0, max(0.0, base_usage * noise_factor))

def generate_soil_moisture(dt, last_irrigation=None, noise=0.1):
    """Generate realistic soil moisture data based on time, season, and irrigation"""
    time_features = generate_time_features(dt)
    hour = time_features['hour']
    season = time_features['season']
    
    # Base moisture level
    if season == 0:  # Winter
        base_moisture = random.uniform(50, 70)  # Winter: typically wetter
    elif season == 2:  # Summer
        base_moisture = random.uniform(30, 50)  # Summer: typically drier
    else:  # Spring/Fall
        base_moisture = random.uniform(40, 60)
    
    # Temperature effect (moisture decreases faster during day in summer)
    if time_features['is_day'] and season == 2:
        base_moisture -= random.uniform(5, 15)
    
    # Irrigation effect
    if last_irrigation is not None:
        hours_since_irrigation = (dt - last_irrigation).total_seconds() / 3600
        if hours_since_irrigation < 24:
            # Moisture boost from recent irrigation
            irrigation_boost = max(0, 30 * (1 - hours_since_irrigation / 24))
            base_moisture += irrigation_boost
    
    # Add some noise
    noise_factor = random.uniform(1 - noise, 1 + noise)
    
    # Return as percentage (0-100%)
    return min(100.0, max(0.0, base_moisture * noise_factor))

def generate_synthetic_data(days=30, interval_hours=1):
    """Generate synthetic data for training models"""
    # Calculate number of data points
    points = days * 24 // interval_hours
    
    # Start date (going back from now)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Generate timestamps
    timestamps = [start_date + timedelta(hours=i*interval_hours) for i in range(points)]
    
    # Initialize data storage
    data = []
    last_irrigation = None
    
    # Generate data for each timestamp
    for dt in timestamps:
        # Time features
        time_features = generate_time_features(dt)
        
        # Energy features
        solar_output = generate_solar_output(dt)
        battery_level = random.uniform(20, 90)  # Battery charge level (%)
        
        # Water features
        water_usage = generate_water_usage(dt)
        water_quality = random.uniform(85, 100)  # Water quality index
        
        # Agriculture features
        soil_moisture = generate_soil_moisture(dt, last_irrigation)
        temperature = random.uniform(10, 35)  # Temperature in Celsius
        
        # Simulate irrigation events (randomly, about once every 2-3 days)
        if random.random() < 0.02:  # ~2% chance each hour
            irrigation_amount = random.uniform(10, 30)  # mm of water
            last_irrigation = dt
        else:
            irrigation_amount = 0
            
        # Add data point
        data_point = {
            'datetime': dt,
            'timestamp': dt.timestamp(),
            **time_features,
            'solar_output': solar_output,
            'battery_level': battery_level,
            'water_usage': water_usage,
            'water_quality': water_quality,
            'soil_moisture': soil_moisture,
            'temperature': temperature,
            'irrigation_amount': irrigation_amount
        }
        
        data.append(data_point)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    return df