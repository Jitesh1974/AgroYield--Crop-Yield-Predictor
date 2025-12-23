import joblib
import os
import numpy as np
from datetime import datetime

MODEL_PATH = "Model_Yield_Predict.joblib"

# Feature names in the EXACT order expected by the model's ColumnTransformer pipeline.
FEATURE_ORDER = [
    "Nitrogen", "Phosphorus", "Potassium", "pH", "Rainfall", "Temperature",
    "District_Name", "Crop", "Fertilizer", "Soil_color", "Season", "Month"
]
NUMERIC_COLS = ["Nitrogen", "Phosphorus", "Potassium", "pH", "Rainfall", "Temperature"]


# Load the model once
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"ML model file not found: {MODEL_PATH}")
    # Load the entire pipeline
    BEST_MODEL_PIPELINE = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading ML model: {e}")
    BEST_MODEL_PIPELINE = None


def get_dynamic_rainfall_and_temp(district, month):
    """
    MOCK FUNCTION: Provides default/mock dynamic weather data.
    """
    print(f"MOCK: Getting dynamic weather for {district} in {month}. Using defaults (Rain=200.0, Temp=28.0).")
    return {
        "Rainfall": 200.0,
        "Temperature": 28.0
    }


def predict_yield(features):
    """
    The core function that prepares the data and calls the ML model.
    """
    if BEST_MODEL_PIPELINE is None:
        print("Model is not loaded. Cannot predict.")
        return None

    # 1. Extract values in the correct order and handle data types
    feature_values = []
    for col in FEATURE_ORDER:
        # Get the single value (e.g., 'Satara') or a default
        value = features.get(col) 
        if isinstance(value, list) and len(value) > 0:
            value = value[0]
        
        # Convert numeric columns to float/int
        if col in NUMERIC_COLS:
            try:
                # Convert to float for numeric processing
                feature_values.append(float(value))
            except:
                # If conversion fails, use NaN for the Imputer to handle
                feature_values.append(np.nan) 
        else:
            # Categorical features must be strings/objects
            feature_values.append(str(value))

    # 2. Reshape the single sample into a 2D array: (1 row, N columns)
    input_array = np.array([feature_values], dtype=object)

    try:
        prediction = BEST_MODEL_PIPELINE.predict(input_array)
        
        # Prediction result is an array, return the scalar value
        return round(prediction[0], 2)

    except Exception as e:
        print(f"Error during model prediction: {e}")
        return None

# --- FIX: ADDED WRAPPER FUNCTION ---
def get_yield_prediction(features):
    """
    Wrapper function to be compatible with voice_assistant.py.
    Calls the actual prediction logic.
    """
    return predict_yield(features)
# ----------------------------------