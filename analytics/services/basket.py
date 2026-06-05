import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

def calculate_association_rules(df: pd.DataFrame, min_support=0.01, min_lift=1.2) -> pd.DataFrame:
    """
    Calculates Market Basket Association Rules.
    df must have: order_id, product_name
    """
    # Group items by order
    baskets = df.groupby('order_id')['product_name'].apply(list).values.tolist()
    
    if len(baskets) < 2:
        return pd.DataFrame() # Not enough data
        
    # One-hot encode the transactions
    te = TransactionEncoder()
    te_ary = te.fit(baskets).transform(baskets)
    df_encoded = pd.DataFrame(te_ary, columns=te.columns_)
    
    # Run apriori
    frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
    
    if frequent_itemsets.empty:
        return pd.DataFrame()
        
    # Generate rules
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=min_lift, num_itemsets=len(frequent_itemsets))
    
    if rules.empty:
        return pd.DataFrame()
        
    # Clean up output
    # mlxtend returns frozensets for antecedents and consequents
    rules['antecedents'] = rules['antecedents'].apply(lambda x: ', '.join(list(x)))
    rules['consequents'] = rules['consequents'].apply(lambda x: ', '.join(list(x)))
    
    # Sort by lift
    rules = rules.sort_values('lift', ascending=False).head(50)
    
    # Only keep important columns
    result = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].copy()
    
    # Format metrics
    result['support'] = result['support'] * 100
    result['confidence'] = result['confidence'] * 100
    
    return result
