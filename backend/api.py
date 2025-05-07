from fastapi import FastAPI
from pydantic import BaseModel, validator
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],  # your Vite dev server
  allow_methods=["*"],
  allow_headers=["*"],
)

# Load the saved model
model = joblib.load("keeper_dive_rf.joblib")
feature_names = joblib.load("feature_names.joblib")

class PenaltyInput(BaseModel):
    Team: str            # e.g. "FRA"
    Foot: str            # "L" or "R"
    Zone: int            # 1–9
    Penalty_Number: int  # e.g. 1–12
    Elimination: int     # 0 or 1

    @validator('Team')
    def validate_team(cls, v):
        valid_teams = ["ARG","BEL","BRA","BUL","CHI","COL","CRA","CRO","DEN","ENG",
                      "FRA","GER","GHA","GRE","HOL","IRE","ITA","JAP","KOR","MEX",
                      "PAR","POR","ROM","RUM","RUS","SPA","SWE","SWZ","UKR","URU","YUG"]
        if v not in valid_teams:
            raise ValueError(f'Team must be one of {valid_teams}')
        return v

    @validator('Foot')
    def validate_foot(cls, v):
        if v not in ['L', 'R']:
            raise ValueError('Foot must be either "L" or "R"')
        return v

    @validator('Zone')
    def validate_zone(cls, v):
        if not 1 <= v <= 9:
            raise ValueError('Zone must be between 1 and 9')
        return v

    @validator('Penalty_Number')
    def validate_penalty_number(cls, v):
        if not 1 <= v <= 12:
            raise ValueError('Penalty_Number must be between 1 and 12')
        return v

    @validator('Elimination')
    def validate_elimination(cls, v):
        if v not in [0, 1]:
            raise ValueError('Elimination must be 0 or 1')
        return v
@app.post("/predict")
def predict(input: PenaltyInput):
    # Build a DataFrame matching your training features
    row = {
      "Foot": 0 if input.Foot == "L" else 1,
      **{f"Zone_{i}": int(input.Zone == i) for i in range(1, 10)},
      **{f"PN_{i}": int(input.Penalty_Number == i) for i in range(1, 13)},
      **{f"Team_{t}": int(input.Team == t) for t in
         ["ARG","BEL","BRA","BUL","CHI","COL","CRA","CRO","DEN","ENG",
          "FRA","GER","GHA","GRE","HOL","IRE","ITA","JAP","KOR","MEX",
          "PAR","POR","ROM","RUM","RUS","SPA","SWE","SWZ","UKR","URU","YUG"]
      },
      "OnTarget": 1,   
      "Goal": 1,
      "Elimination": input.Elimination
    }
    X = pd.DataFrame([row])

    for col in feature_names:
      if col not in X.columns:
            X[col] = 0
    X = X[feature_names]
    
    probs = model.predict_proba(X)[0]               # e.g. [0.2, 0.6, 0.2]
    # pick the indices of the top two probabilities
    top2 = probs.argsort()[-2:][::-1]               # e.g. [1, 0]
    label_map = {0: "Left", 1: "Center", 2: "Right"}
    # map to labels
    top2_labels = [label_map[i] for i in top2]      # e.g. ["Center","Left"]
    # optional: return their probabilities too
    top2_probs = { label_map[i]: float(probs[i]) for i in top2 }

    return {
      "dive_zones": top2_labels,
      "probabilities": top2_probs
    }