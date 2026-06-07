import pandas as pd
from datetime import datetime

def calculate_rfm(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates RFM segments.
    df must have: customer_id, order_date, total
    """
    # Ensure order_date is datetime
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    # Use max date in dataset as 'today' + 1 day to ensure recency is at least 1
    snapshot_date = df['order_date'].max() + pd.Timedelta(days=1)
    
    # Aggregate at customer level
    rfm = df.groupby('customer_id').agg({
        'order_date': lambda x: (snapshot_date - x.max()).days,
        'customer_id': 'count',
        'total': 'sum'
    }).rename(columns={
        'order_date': 'R',
        'customer_id': 'F',
        'total': 'M'
    }).reset_index()
    
    # If we have very few customers, quintiles might fail with duplicates. Use rank.
    # Recency: lower is better (5 is best)
    # Frequency & Monetary: higher is better (5 is best)
    
    # Calculate quantiles safely (if too few unique values, drop_duplicates behavior is needed)
    try:
        r_labels = range(5, 0, -1) # 5, 4, 3, 2, 1
        f_labels = range(1, 6)     # 1, 2, 3, 4, 5
        m_labels = range(1, 6)     # 1, 2, 3, 4, 5
        
        # We use rank method 'first' to avoid value error when there are many identical values (e.g., F=1)
        rfm['R_score'] = pd.qcut(rfm['R'].rank(method='first'), q=5, labels=r_labels).astype(int)
        rfm['F_score'] = pd.qcut(rfm['F'].rank(method='first'), q=5, labels=f_labels).astype(int)
        rfm['M_score'] = pd.qcut(rfm['M'].rank(method='first'), q=5, labels=m_labels).astype(int)
    except ValueError:
        # Fallback if extremely small dataset
        rfm['R_score'] = 3
        rfm['F_score'] = 3
        rfm['M_score'] = 3

    rfm['rfm_score'] = rfm['R_score'].astype(str) + rfm['F_score'].astype(str) + rfm['M_score'].astype(str)
    
    # Segmentation rules
    def assign_segment(row):
        r, f, m = row['R_score'], row['F_score'], row['M_score']
        
        if r == 5 and f == 5 and m == 5:
            return "Champions"
        elif r >= 4 and f >= 4:
            return "Loyal"
        elif r <= 3 and (f >= 4 or m >= 4):
            return "At Risk"
        elif r <= 2 and f <= 2:
            return "Lost"
        elif f == 1:
            return "New"
        else:
            return "Potential"
            
    rfm['segment'] = rfm.apply(assign_segment, axis=1)
    
    return rfm
