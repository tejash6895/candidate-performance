from fastapi import FastAPI, HTTPException
from joblib import load
import pandas as pd

app = FastAPI()

# Load preprocessed data
data = load("processed_data.joblib")  # Ensure this file exists
data['CET_NO'] = data['CET_NO'].astype(str).str.strip()
data['REG_NO'] = data['REG_NO'].astype(str).str.strip()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Candidate Performance API!"}

@app.get("/search/")
def search_candidate(cet_no: str = None, reg_no: str = None):
    if bool(cet_no) == bool(reg_no):
        raise HTTPException(status_code=400, detail="Provide exactly one of CET_NO or REG_NO.")

    if cet_no:
        candidate = data[data['CET_NO'] == cet_no]
    else:
        candidate = data[data['REG_NO'] == reg_no]

    if candidate.empty:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    candidate = candidate.iloc[0]
    sorted_data = data.sort_values(by="Total_Marks", ascending=False)
    top_candidates = sorted_data.head(20)

    # Add candidate to the top candidates list if not already included
    if candidate['CET_NO'] not in top_candidates['CET_NO'].values:
        top_candidates = pd.concat([top_candidates, candidate.to_frame().T])
        top_candidates = top_candidates.sort_values(by="Total_Marks", ascending=False)

    chart_data = [
        {
            "name": row['Candidate_Name'],
            "total_marks": row['Total_Marks'],
            "is_highlighted": row['CET_NO'] == cet_no
        }
        for _, row in top_candidates.iterrows()
    ]

    return {
        "candidate": {
            "name": candidate['Candidate_Name'],
            "total_marks": candidate['Total_Marks'],
        },
        "chart_data": chart_data,
    }
