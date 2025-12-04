from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Path to the logistic regression web pipeline
MODEL_PATH = os.path.join(os.path.dirname(__file__), "web_pipeline_lr.pkl")

# Features used in the model (must match training code)
DEPLOY_FEATURES = [
    "loan_amnt",
    "int_rate",
    "annual_inc",
    "dti",
    "fico_range_low",
    "fico_range_high",
    "term_36",
]

pipeline = None

def load_model():
    """Lazy-load the model to avoid heavy work at import time."""
    global pipeline
    if pipeline is None:
        pipeline = joblib.load(MODEL_PATH)
    return pipeline


@app.route("/")
def home():
    return "LendingClub default risk API is running."


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        # Validate and build input row
        row = {}
        for f in DEPLOY_FEATURES:
            if f not in data:
                return jsonify({"error": f"Missing required field: {f}"}), 400
            row[f] = data[f]

        X_new = pd.DataFrame([row])

        model = load_model()
        proba_default = float(model.predict_proba(X_new)[0, 1])
        prediction = int(proba_default >= 0.5)

        if prediction == 1:
            label = "High default risk"
        else:
            label = "Lower default risk"

        return jsonify(
            {
                "input": row,
                "prob_default": proba_default,
                "prediction": prediction,
                "label": label,
            }
        )

    except Exception as e:
        # Helpful error in logs + safe JSON message
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
