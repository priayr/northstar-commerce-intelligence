import pandas as pd
import numpy as np

def detect_anomalies(data: list):
    if not data or len(data) < 14:
        return []
        
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date').sort_index()
    
    val_col = 'revenue' if 'revenue' in df.columns else 'orders' if 'orders' in df.columns else 'value' if 'value' in df.columns else df.columns[0]
    
    # Ensure daily frequency
    df = df.resample('D').sum().fillna(0)
    
    # 14-day rolling mean and std
    rolling_mean = df[val_col].rolling(window=14, min_periods=7).mean()
    rolling_std = df[val_col].rolling(window=14, min_periods=7).std()
    
    anomalies = []
    
    for idx, row in df.iterrows():
        actual = row[val_col]
        mean = rolling_mean.loc[idx]
        std = rolling_std.loc[idx]
        
        if pd.isna(mean) or pd.isna(std) or std == 0:
            continue
            
        delta = actual - mean
        severity = None
        
        # 2.5 standard deviations from the mean
        if actual > mean + 2.5 * std:
            severity = "spike"
        elif actual < mean - 2.5 * std:
            severity = "drop"
            
        if severity:
            pct_deviation = (delta / mean * 100) if mean > 0 else 0
            anomalies.append({
                "date": idx.strftime("%Y-%m-%d"),
                "actual": float(actual),
                "expected": float(mean),
                "delta": float(delta),
                "deviation_pct": float(pct_deviation),
                "severity": severity
            })
            
    # Sort descending by date (newest anomalies first)
    anomalies.sort(key=lambda x: x['date'], reverse=True)
    return anomalies
