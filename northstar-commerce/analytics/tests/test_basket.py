import pandas as pd
from services.basket import calculate_association_rules

def test_calculate_basket():
    # 5 orders. 
    # Order 1: Milk, Bread
    # Order 2: Milk, Bread, Butter
    # Order 3: Milk
    # Order 4: Bread, Butter
    # Order 5: Milk, Bread, Butter
    data = {
        'order_id': [1, 1, 2, 2, 2, 3, 4, 4, 5, 5, 5],
        'product_name': [
            'Milk', 'Bread', 
            'Milk', 'Bread', 'Butter', 
            'Milk', 
            'Bread', 'Butter',
            'Milk', 'Bread', 'Butter'
        ]
    }
    df = pd.DataFrame(data)
    
    rules = calculate_association_rules(df, min_support=0.2, min_lift=1.0)
    
    # We expect some rules to be generated
    assert not rules.empty
    
    # Check that 'support', 'confidence', 'lift' columns exist
    assert 'support' in rules.columns
    assert 'confidence' in rules.columns
    assert 'lift' in rules.columns
