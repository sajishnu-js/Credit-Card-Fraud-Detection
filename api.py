"""
Credit Card Fraud Detection API
--------------------------------
A Flask wrapper around the 3 trained models, serving as the backend for the
Next.js frontend (see frontend/).

Folder layout expected:
    project/
      api.py                      <- this file
      Saved Model/
        LogisticRegression.pkl
        RandomForest.pkl
        XGBoost.pkl
      Preprocessed datasets/
        scaler.pkl

Run it with:
    pip install -r requirements.txt
    python api.py

It will start on http://127.0.0.1:5001 (override with the PORT env var).

For production, use Gunicorn instead of the Flask dev server:
    gunicorn api:app --bind 0.0.0.0:$PORT
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)

# Allow every origin by default so local development and the bundled frontend
# work out of the box. In production set ALLOWED_ORIGINS to a comma-separated
# list of frontend origins, e.g. "https://sentinel-fraud-console.vercel.app".
_allowed = os.environ.get('ALLOWED_ORIGINS', '*').strip()
if _allowed and _allowed != '*':
    CORS(app, origins=[o.strip() for o in _allowed.split(',') if o.strip()])
else:
    CORS(app)

FEATURE_COLUMNS = (
    ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
)

# Resolve artifacts relative to this file, not the working directory, so the
# API works under gunicorn, a serverless handler, or `python api.py` alike.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    'logistic_regression': os.path.join(BASE_DIR, 'Saved Model', 'LogisticRegression.pkl'),
    'random_forest': os.path.join(BASE_DIR, 'Saved Model', 'RandomForest.pkl'),
    'xgboost': os.path.join(BASE_DIR, 'Saved Model', 'XGBoost.pkl'),
}
SCALER_PATH = os.path.join(BASE_DIR, 'Preprocessed datasets', 'scaler.pkl')

models = {}
scaler = None
load_errors = []

def load_artifacts():
    global scaler
    for name, path in MODEL_PATHS.items():
        try:
            models[name] = joblib.load(path)
        except Exception as e:
            load_errors.append(f"Could not load '{name}' from {path}: {e}")
    try:
        scaler = joblib.load(SCALER_PATH)
    except Exception as e:
        load_errors.append(f"Could not load scaler from {SCALER_PATH}: {e}")

load_artifacts()


@app.route('/health', methods=['GET'])
def health():
    """Quick check that the API is alive and which models loaded correctly."""
    return jsonify({
        'status': 'ok',
        'models_loaded': list(models.keys()),
        'scaler_loaded': scaler is not None,
        'load_errors': load_errors
    })


@app.route('/models', methods=['GET'])
def list_models():
    """List the model keys you can pass in the 'model' field of /predict."""
    return jsonify({'available_models': list(models.keys())})


@app.route('/predict', methods=['POST'])
def predict():
    """
    Body (raw JSON):
    {
        "model": "random_forest",   // or "logistic_regression" / "xgboost"
        "features": {
            "Time": 0, "V1": -1.36, "V2": -0.07, ... "V28": -0.02,
            "Amount": 149.62
        }
    }
    """
    if not models or scaler is None:
        return jsonify({'error': 'Models/scaler not loaded on server.', 'details': load_errors}), 500

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Request body must be JSON.'}), 400

    model_key = data.get('model')
    features = data.get('features')

    if model_key not in models:
        return jsonify({
            'error': f"Unknown model '{model_key}'.",
            'available_models': list(models.keys())
        }), 400

    if not features:
        return jsonify({'error': "Missing 'features' object in body."}), 400

    missing = [c for c in FEATURE_COLUMNS if c not in features]
    if missing:
        return jsonify({'error': 'Missing feature fields.', 'missing': missing}), 400

    row = pd.DataFrame([[features[c] for c in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)
    row[['Time', 'Amount']] = scaler.transform(row[['Time', 'Amount']])

    model = models[model_key]
    prediction = int(model.predict(row)[0])
    probability = float(model.predict_proba(row)[0][1])

    return jsonify({
        'model_used': model_key,
        'prediction': prediction,
        'result': 'Fraud' if prediction == 1 else 'Legitimate',
        'fraud_probability': round(probability * 100, 2)
    })


@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    form-data:
      key 'model' (text) = e.g. random_forest
      key 'file'  (file) = a CSV with columns Time, V1..V28, Amount
    """
    if not models or scaler is None:
        return jsonify({'error': 'Models/scaler not loaded on server.', 'details': load_errors}), 500

    model_key = request.form.get('model')
    if model_key not in models:
        return jsonify({
            'error': f"Unknown or missing model '{model_key}'.",
            'available_models': list(models.keys())
        }), 400

    if 'file' not in request.files:
        return jsonify({'error': "No file uploaded under key 'file'."}), 400

    file = request.files['file']
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({'error': f'Could not parse CSV: {e}'}), 400

    missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing:
        return jsonify({'error': 'CSV missing required columns.', 'missing': missing}), 400

    df_scaled = df.copy()
    df_scaled[['Time', 'Amount']] = scaler.transform(df_scaled[['Time', 'Amount']])
    features_only = df_scaled[FEATURE_COLUMNS]

    model = models[model_key]
    predictions = model.predict(features_only)
    probabilities = model.predict_proba(features_only)[:, 1]

    results = []
    for i in range(len(df)):
        results.append({
            'row': i,
            'prediction': int(predictions[i]),
            'result': 'Fraud' if predictions[i] == 1 else 'Legitimate',
            'fraud_probability': round(float(probabilities[i]) * 100, 2)
        })

    return jsonify({
        'model_used': model_key,
        'rows_processed': len(df),
        'fraud_count': int(predictions.sum()),
        'legit_count': int(len(df) - predictions.sum()),
        'results': results
    })


if __name__ == '__main__':
    print("Loaded models:", list(models.keys()))
    if load_errors:
        print("Load warnings:", load_errors)
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, use_reloader=False)
