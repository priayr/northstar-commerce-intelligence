import pandas as pd
from services.rfm import calculate_rfm

def test_calculate_rfm():
    data = {
        'customer_id': ['1', '1', '2', '3', '3', '3'],
        'order_date': ['2023-01-01', '2023-06-01', '2023-02-01', '2023-05-01', '2023-05-15', '2023-06-10'],
        'total': [100, 150, 200, 50, 75, 125]
    }
    df = pd.DataFrame(data)
    
    rfm = calculate_rfm(df)
    
    # 3 unique customers
    assert len(rfm) == 3
    
    # Customer 3 has 3 orders (most frequent)
    assert rfm[rfm['customer_id'] == '3']['F'].iloc[0] == 3
    
    # Customer 2 has $200 total, but Customer 1 has $250, Customer 3 has $250
    assert rfm[rfm['customer_id'] == '1']['M'].iloc[0] == 250
