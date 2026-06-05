import pandas as pd

def calculate_cohort_retention(df: pd.DataFrame):
    """
    Calculates monthly cohort retention.
    df must have: customer_id, order_date
    """
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    # Get the month of the order
    df['order_month'] = df['order_date'].dt.to_period('M')
    
    # Find the first month the customer made a purchase (cohort month)
    df['cohort_month'] = df.groupby('customer_id')['order_date'].transform('min').dt.to_period('M')
    
    # Create a cohort grouping
    cohort_data = df.groupby(['cohort_month', 'order_month']).agg(n_customers=('customer_id', 'nunique')).reset_index()
    
    # Calculate period difference in months
    cohort_data['period_number'] = (cohort_data.order_month - cohort_data.cohort_month).apply(lambda x: x.n)
    
    # Pivot the data
    cohort_pivot = cohort_data.pivot_table(index='cohort_month', columns='period_number', values='n_customers')
    
    # Get the size of the cohort (Month 0)
    cohort_size = cohort_pivot.iloc[:, 0]
    
    # Divide by cohort size to get percentage
    retention_matrix = cohort_pivot.divide(cohort_size, axis=0) * 100
    
    # Round to 1 decimal place
    retention_matrix = retention_matrix.round(1)
    
    return retention_matrix, cohort_size
