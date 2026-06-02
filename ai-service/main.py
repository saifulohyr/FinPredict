"""
FinPredict AI Service - FastAPI Server
=======================================
Serves LSTM model predictions for the FinPredict app.

Endpoints:
  GET  /         -> Welcome message
  GET  /health   -> Model status check
  POST /predict  -> Single user prediction
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from inference import (
    load_model,
    load_scalers,
    predict,
    FEATURE_COLS,
    SEQ_LEN,
    N_FEATURES,
    THRESHOLD,
)


# ============================================================================
# LIFESPAN - Load model at startup
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and scalers when the server starts."""
    print("🚀 Starting FinPredict AI Service...")
    try:
        load_model()
        load_scalers()
        print("✅ All models loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load models: {e}")
        raise
    yield
    print("👋 Shutting down AI Service...")


# ============================================================================
# APP
# ============================================================================

app = FastAPI(
    title="FinPredict AI Service",
    description="LSTM-based financial prediction API for Gen Z spending behavior",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# SCHEMAS
# ============================================================================

class TransactionFeatures(BaseModel):
    """Single transaction with 37 features."""
    total_pengeluaran_harian: float = 0
    total_pemasukan_harian: float = 0
    saldo_berjalan: float = 0
    saldo_bersih_harian: float = 0
    total_wants_harian: float = 0
    rasio_wants: float = 0
    doom_spending_harian: float = 0
    shock_harian: float = 0
    pengeluaran_makanan: float = 0
    rasio_makanan: float = 0
    hari_dalam_bulan: int = 1
    hari_dalam_minggu: int = 0
    bulan: int = 1
    is_weekend: int = 0
    is_harbolnas: int = 0
    fase_bulan_encoded: int = 0
    sin_doy: float = 0
    cos_doy: float = 1
    sin_dom: float = 0
    cos_dom: float = 1
    pengeluaran_lag_1d: float = 0
    pengeluaran_lag_3d: float = 0
    pengeluaran_lag_7d: float = 0
    saldo_lag_1d: float = 0
    wants_lag_3d: float = 0
    doom_lag_7d: float = 0
    rolling_mean_7d: float = 0
    rolling_mean_14d: float = 0
    rolling_mean_30d: float = 0
    rolling_std_7d: float = 0
    rolling_max_7d: float = 0
    rolling_wants_7d: float = 0
    days_to_ruin: float = 999
    interaksi_hedon_muda: float = 0
    kebiasaan_boros_harian: float = 0
    is_doom_spending: int = 0
    is_financial_shock: int = 0
    usia: int = 22
    tipe_user_encoded: int = 0


class PredictRequest(BaseModel):
    """Request body for /predict endpoint."""
    user_id: str = Field(..., description="User ID (must match scaler key)")
    transactions: list[TransactionFeatures] = Field(
        ...,
        description=f"List of {SEQ_LEN}+ transactions, chronologically ordered",
        min_length=1,
    )


class PredictResponse(BaseModel):
    """Response from /predict endpoint."""
    error: bool
    prediksi_besok: int | None
    probabilitas: float | None
    status_warning: str
    model_digunakan: str
    threshold: float = THRESHOLD
    rekomendasi: str = ""
    user_id: str = ""
    sequence_length: int = SEQ_LEN
    n_features: int = N_FEATURES
    message: str = ""


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Welcome / root endpoint."""
    return {
        "service": "FinPredict AI Service",
        "model": "LSTM",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check - verify model and scalers are loaded."""
    from inference import _model, _scalers

    model_loaded = _model is not None
    scalers_loaded = _scalers is not None
    scaler_count = len(_scalers) if _scalers else 0

    return {
        "status": "healthy" if model_loaded and scalers_loaded else "unhealthy",
        "model_loaded": model_loaded,
        "scalers_loaded": scalers_loaded,
        "scaler_count": scaler_count,
        "model_type": "LSTM",
        "sequence_length": SEQ_LEN,
        "n_features": N_FEATURES,
        "threshold": THRESHOLD,
    }


@app.post("/predict", response_model=PredictResponse)
async def predict_endpoint(request: PredictRequest):
    """
    Predict tomorrow's spending risk for a user.

    Requires at least 30 chronological transactions (each with 37 features).
    Returns AMAN (safe) or BAHAYA (danger) prediction.
    """
    try:
        # Convert Pydantic models to dicts
        transactions = [txn.model_dump() for txn in request.transactions]

        result = predict(request.user_id, transactions)

        return PredictResponse(**result)

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/features")
async def get_features():
    """Return the list of required features and their order."""
    return {
        "feature_count": N_FEATURES,
        "sequence_length": SEQ_LEN,
        "features": FEATURE_COLS,
        "note": "Each transaction must contain ALL features in this exact order",
    }


# ============================================================================
# RUN (for local development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
