"""
FinPredict AI Service - LSTM Inference Module
==============================================
Loads trained LSTM model and scalers, performs prediction.

Model: model_lstm.h5 (Keras Sequential)
Architecture: LSTM(64) -> Dropout(0.2) -> LSTM(32) -> Dropout(0.2) -> Dense(16) -> Dense(1, sigmoid)
Input shape: (1, SEQ_LEN=30, N_FEATURES=37)
Output: P(BAHAYA) -> threshold 0.55

Scaler: MinMaxScaler per user from scalers_v8.pkl
"""

import os
import pickle
import numpy as np
import tensorflow as tf

# ============================================================================
# CONSTANTS - must match training notebook exactly
# ============================================================================

SEQ_LEN = 30  # sequence length (30 days of transactions)
THRESHOLD = 0.55  # optimized threshold (prioritize Recall over Precision)

FEATURE_COLS = [
    # Numerik utama
    'total_pengeluaran_harian', 'total_pemasukan_harian',
    'saldo_berjalan', 'saldo_bersih_harian',
    'total_wants_harian', 'rasio_wants',
    'doom_spending_harian', 'shock_harian',
    'pengeluaran_makanan', 'rasio_makanan',
    # Temporal
    'hari_dalam_bulan', 'hari_dalam_minggu',
    'bulan', 'is_weekend', 'is_harbolnas',
    'fase_bulan_encoded',
    # Cyclical encoding
    'sin_doy', 'cos_doy', 'sin_dom', 'cos_dom',
    # Lag
    'pengeluaran_lag_1d', 'pengeluaran_lag_3d', 'pengeluaran_lag_7d',
    'saldo_lag_1d', 'wants_lag_3d', 'doom_lag_7d',
    # Rolling
    'rolling_mean_7d', 'rolling_mean_14d', 'rolling_mean_30d',
    'rolling_std_7d', 'rolling_max_7d', 'rolling_wants_7d',
    # Derived & interaksi
    'days_to_ruin', 'interaksi_hedon_muda',
    'kebiasaan_boros_harian', 'is_doom_spending', 'is_financial_shock',
    # Profil user
    'usia', 'tipe_user_encoded',
]

N_FEATURES = len(FEATURE_COLS)  # 37

# ============================================================================
# MODEL & SCALER LOADING
# ============================================================================

_model = None
_scalers = None
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))


def load_model():
    """Load LSTM model from .h5 file at startup."""
    global _model
    model_path = os.path.join(MODEL_DIR, 'model_lstm.h5')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    _model = tf.keras.models.load_model(model_path)
    print(f"✅ LSTM model loaded: {model_path}")
    print(f"   Input shape: {_model.input_shape}")
    print(f"   Output shape: {_model.output_shape}")
    return _model


def load_scalers():
    """Load fitted MinMaxScalers per user from pickle file."""
    global _scalers
    scaler_path = os.path.join(MODEL_DIR, 'scalers_v8.pkl')
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scalers not found: {scaler_path}")
    with open(scaler_path, 'rb') as f:
        _scalers = pickle.load(f)
    print(f"✅ Scalers loaded: {len(_scalers)} users")
    return _scalers


def get_model():
    """Get loaded model, load if not yet loaded."""
    global _model
    if _model is None:
        load_model()
    return _model


def get_scalers():
    """Get loaded scalers, load if not yet loaded."""
    global _scalers
    if _scalers is None:
        load_scalers()
    return _scalers


# ============================================================================
# PREDICTION
# ============================================================================

def predict(user_id: str, transactions: list[dict]) -> dict:
    """
    Run LSTM prediction for a user based on their transaction history.

    Args:
        user_id: User identifier (must match a key in scalers_v8.pkl)
        transactions: List of dicts, each containing the 37 feature values.
                      Must have at least SEQ_LEN (30) entries, ordered chronologically.

    Returns:
        dict with prediction results
    """
    model = get_model()
    scalers = get_scalers()

    # Validate input length
    if len(transactions) < SEQ_LEN:
        return {
            "error": True,
            "message": f"Butuh minimal {SEQ_LEN} transaksi, diterima {len(transactions)}",
            "prediksi_besok": None,
            "probabilitas": None,
            "status_warning": "INSUFFICIENT_DATA",
            "model_digunakan": "LSTM",
        }

    # Build feature matrix from transactions
    # Use the last SEQ_LEN transactions
    recent = transactions[-SEQ_LEN:]
    feature_matrix = []

    for txn in recent:
        row = []
        for col in FEATURE_COLS:
            val = txn.get(col, 0.0)
            row.append(float(val) if val is not None else 0.0)
        feature_matrix.append(row)

    X = np.array(feature_matrix, dtype=np.float32)  # shape: (30, 37)

    # Apply scaler if available for this user
    if user_id in scalers:
        scaler = scalers[user_id]
        try:
            X = scaler.transform(X)
        except Exception as e:
            print(f"⚠️ Scaler transform failed for {user_id}: {e}")
            # Continue without scaling — model may still work
    else:
        print(f"⚠️ No scaler found for user {user_id}, using raw features")

    # Reshape for LSTM: (1, SEQ_LEN, N_FEATURES)
    X_seq = X.reshape(1, SEQ_LEN, N_FEATURES)

    # Predict
    prob = float(model.predict(X_seq, verbose=0).flatten()[0])
    pred = 1 if prob >= THRESHOLD else 0
    status = "BAHAYA" if pred == 1 else "AMAN"

    # Generate recommendation
    if pred == 1:
        if prob >= 0.8:
            rekomendasi = "⚠️ Risiko sangat tinggi! Segera kurangi pengeluaran non-esensial."
        elif prob >= 0.65:
            rekomendasi = "⚠️ Pengeluaran diprediksi melebihi batas aman. Evaluasi pola belanja Anda."
        else:
            rekomendasi = "⚠️ Ada potensi overspending. Perhatikan pengeluaran kategori 'Wants'."
    else:
        if prob <= 0.2:
            rekomendasi = "✅ Keuangan sangat sehat! Pertahankan pola ini."
        elif prob <= 0.4:
            rekomendasi = "✅ Pengeluaran dalam batas aman. Tetap pantau arus kas."
        else:
            rekomendasi = "✅ Masih aman, tapi mendekati batas. Waspada terhadap pengeluaran impulsif."

    return {
        "error": False,
        "prediksi_besok": pred,
        "probabilitas": round(prob, 4),
        "status_warning": status,
        "model_digunakan": "LSTM",
        "threshold": THRESHOLD,
        "rekomendasi": rekomendasi,
        "user_id": user_id,
        "sequence_length": SEQ_LEN,
        "n_features": N_FEATURES,
    }
