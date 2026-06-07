import sqlite3
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List, Dict, Any

from services.rfm import calculate_rfm
from services.basket import calculate_association_rules
from services.cohort import calculate_cohort_retention
from services.forecasting import generate_forecast
from services.anomaly import detect_anomalies

app = FastAPI(title="Northstar Analytics API", version="1.0.0")

# Allow Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database path
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "prisma", "dev.db")

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

from typing import Optional

# --- Models ---
class AnalyticsRequest(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    min_support: Optional[float] = 0.01
    min_lift: Optional[float] = 1.2

class TimeSeriesRequest(BaseModel):
    data: List[Dict[str, Any]]
    horizon: Optional[int] = 30

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/rfm")
def get_rfm_segments(req: AnalyticsRequest):
    """Calculate RFM segments for customers."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    query = """
    SELECT 
        customer_id, 
        order_date, 
        total 
    FROM orders
    WHERE status != 'CANCELLED'
    """
    
    # We could add date filtering here, but usually RFM looks at the whole lifetime or a fixed trailing period.
    # We will compute over all available data or filter if requested.
    if req.start_date and req.end_date:
        query += f" AND order_date BETWEEN '{req.start_date}' AND '{req.end_date}'"
        
    try:
        df = pd.read_sql(query, conn)
        if df.empty:
            return {"data": [], "summary": {}}
        
        rfm_result = calculate_rfm(df)
        
        # Summary for KPIs
        summary = {
            "total_customers": int(rfm_result["customer_id"].nunique()),
            "avg_ltv": float(rfm_result["M"].mean()),
            "avg_orders": float(rfm_result["F"].mean()),
            "new_customers": int(len(rfm_result[rfm_result["segment"] == "New"])),
            "returning_customers": int(len(rfm_result[rfm_result["segment"] != "New"])),
        }
        
        return {
            "data": rfm_result.to_dict(orient="records"),
            "summary": summary
        }
    except Exception as e:
        print(f"Error in RFM: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/basket")
def get_basket_rules(req: AnalyticsRequest):
    """Calculate Market Basket Association Rules."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    query = """
    SELECT 
        o.id as order_id, 
        p.name as product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status != 'CANCELLED'
    """
    
    if req.start_date and req.end_date:
        query += f" AND o.order_date BETWEEN '{req.start_date}' AND '{req.end_date}'"
        
    try:
        df = pd.read_sql(query, conn)
        if df.empty:
            return {"rules": [], "summary": {}}
            
        rules = calculate_association_rules(
            df, 
            min_support=req.min_support or 0.01, 
            min_lift=req.min_lift or 1.2
        )
        
        # Summary stats
        orders_per_product = df.groupby("order_id").size()
        multi_item_orders = (orders_per_product > 1).sum()
        
        summary = {
            "avg_items_per_order": float(orders_per_product.mean()),
            "multi_item_order_pct": float(multi_item_orders / len(orders_per_product) * 100),
            "top_lift": float(rules["lift"].max()) if not rules.empty else 0,
            "bundle_opportunities": int(len(rules[rules["lift"] > 2.0])) if not rules.empty else 0,
        }
        
        return {
            "rules": rules.to_dict(orient="records"),
            "summary": summary
        }
    except Exception as e:
        print(f"Error in Basket: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/forecast")
def api_forecast(req: TimeSeriesRequest):
    try:
        if not req.data:
            raise ValueError("Empty data payload")
        result = generate_forecast(req.data, req.horizon)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anomalies")
def api_anomalies(req: TimeSeriesRequest):
    try:
        if not req.data:
            raise ValueError("Empty data payload")
        result = detect_anomalies(req.data)
        return {"anomalies": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cohort")
def get_cohort_retention(req: AnalyticsRequest):
    """Calculate Monthly Cohort Retention."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    query = """
    SELECT 
        customer_id, 
        order_date 
    FROM orders
    WHERE status != 'CANCELLED'
    """
    
    try:
        df = pd.read_sql(query, conn)
        if df.empty:
            return {"matrix": [], "cohort_sizes": {}}
            
        retention_matrix, cohort_sizes = calculate_cohort_retention(df)
        
        # Convert index to string for JSON serialization
        retention_matrix.index = retention_matrix.index.astype(str)
        cohort_sizes.index = cohort_sizes.index.astype(str)
        
        # Convert to a format easy for the frontend heatmap
        # {"2025-01": {"0": 100.0, "1": 45.2, ...}, ...}
        matrix_dict = retention_matrix.to_dict(orient="index")
        
        return {
            "matrix": matrix_dict,
            "cohort_sizes": cohort_sizes.to_dict()
        }
    except Exception as e:
        print(f"Error in Cohort: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
