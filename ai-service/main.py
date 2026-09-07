from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="KisanSetu AI Service",
    description="Python microservice for market recommendations, price predictions, and buyer matching. (Currently using heuristic fallbacks due to missing ML models in repository).",
    version="1.0.0"
)

# --- Pydantic Models ---

class PredictPriceRequest(BaseModel):
    cropType: str
    state: str
    district: str
    targetDate: str
    quantity: float

class PredictPriceResponse(BaseModel):
    predictedPrice: float
    trend: str
    reasonHi: str
    reason: str

class MatchBuyersRequest(BaseModel):
    lotId: str
    farmerId: str

class MatchItem(BaseModel):
    buyerId: str
    matchScore: float
    reason: str

class MatchBuyersResponse(BaseModel):
    matches: List[MatchItem]

class MarketRecRequest(BaseModel):
    cropType: str
    quantity: float
    currentPrice: float
    district: str
    state: str

class MarketRecResponse(BaseModel):
    action: str
    confidence: float
    reasonHi: str
    reason: str
    priceOutlook: str

# --- Endpoints ---

@app.get("/health")
def health_check():
    """Independent verification endpoint."""
    return {"status": "ok", "service": "KisanSetu AI", "ml_models_loaded": False}

@app.post("/predict-price", response_model=PredictPriceResponse)
def predict_price(req: PredictPriceRequest):
    """
    Predict crop price for a target date.
    Note: Real ML models are missing. This uses a heuristic fallback.
    """
    # Heuristic fallback logic
    base_price = 2200.0
    if req.cropType.lower() == "wheat":
        base_price = 2400.0
    elif req.cropType.lower() == "rice":
        base_price = 3000.0
        
    return PredictPriceResponse(
        predictedPrice=base_price,
        trend="up",
        reasonHi="मांग अधिक है (Heuristic)",
        reason="High seasonal demand (Heuristic fallback, no ML model available)"
    )

@app.post("/match-buyers", response_model=MatchBuyersResponse)
def match_buyers(req: MatchBuyersRequest):
    """
    Match lot to buyers.
    Note: Real dataset/embeddings are missing. This returns a generic mock match.
    """
    return MatchBuyersResponse(
        matches=[
            MatchItem(
                buyerId="buyer_demo_1",
                matchScore=0.92,
                reason="Quantity and location match perfectly."
            )
        ]
    )

@app.post("/market-recommendation", response_model=MarketRecResponse)
def market_recommendation(req: MarketRecRequest):
    """
    Provide sell/wait advice.
    Note: ML pipeline missing, using static thresholds.
    """
    action = "sell" if req.currentPrice >= 2000 else "wait"
    outlook = "stable" if req.currentPrice >= 2000 else "improving"
    reason = "Prices are currently favorable." if action == "sell" else "Prices expected to rise next week."
    reasonHi = "कीमतें अनुकूल हैं।" if action == "sell" else "अगले सप्ताह कीमतें बढ़ने की उम्मीद है।"
    
    return MarketRecResponse(
        action=action,
        confidence=0.85,
        reasonHi=reasonHi + " (Heuristic)",
        reason=reason + " (Heuristic fallback, no ML model available)",
        priceOutlook=outlook
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
