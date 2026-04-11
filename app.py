import streamlit as st
import pandas as pd
import numpy as np
import joblib

# Load models and scaler
lr  = joblib.load('Saved Model/LogisticRegression.pkl')
rf  = joblib.load('Saved Model/RandomForest.pkl')
xgb = joblib.load('Saved Model/XGBoost.pkl')
scaler = joblib.load('Preprocessed datasets/scaler.pkl')

models = {
    'Logistic Regression': lr,
    'Random Forest': rf,
    'XGBoost': xgb
}

# Page config
st.set_page_config(page_title='Credit Card Fraud Detection', layout='centered')

st.title('Credit Card Fraud Detection')
st.write('Select a model and enter transaction details to check if a transaction is fraudulent.')

st.divider()

# Model selection
model_name = st.selectbox('Select Model', list(models.keys()))
model = models[model_name]

st.divider()

# Input method
input_method = st.radio('Input Method', ['Manual Entry', 'Upload CSV'])

# ── Manual Entry ─────────────────────────────────────────────────────────────
if input_method == 'Manual Entry':

    st.subheader('Enter Transaction Details')

    col1, col2 = st.columns(2)

    with col1:
        time   = st.number_input('Time',   value=0.0)
        amount = st.number_input('Amount', value=0.0, min_value=0.0)
        v1  = st.number_input('V1',  value=0.0)
        v2  = st.number_input('V2',  value=0.0)
        v3  = st.number_input('V3',  value=0.0)
        v4  = st.number_input('V4',  value=0.0)
        v5  = st.number_input('V5',  value=0.0)
        v6  = st.number_input('V6',  value=0.0)
        v7  = st.number_input('V7',  value=0.0)
        v8  = st.number_input('V8',  value=0.0)
        v9  = st.number_input('V9',  value=0.0)
        v10 = st.number_input('V10', value=0.0)
        v11 = st.number_input('V11', value=0.0)
        v12 = st.number_input('V12', value=0.0)

    with col2:
        v13 = st.number_input('V13', value=0.0)
        v14 = st.number_input('V14', value=0.0)
        v15 = st.number_input('V15', value=0.0)
        v16 = st.number_input('V16', value=0.0)
        v17 = st.number_input('V17', value=0.0)
        v18 = st.number_input('V18', value=0.0)
        v19 = st.number_input('V19', value=0.0)
        v20 = st.number_input('V20', value=0.0)
        v21 = st.number_input('V21', value=0.0)
        v22 = st.number_input('V22', value=0.0)
        v23 = st.number_input('V23', value=0.0)
        v24 = st.number_input('V24', value=0.0)
        v25 = st.number_input('V25', value=0.0)
        v26 = st.number_input('V26', value=0.0)
        v27 = st.number_input('V27', value=0.0)
        v28 = st.number_input('V28', value=0.0)

    if st.button('Predict'):

        # Build input dataframe
        input_data = pd.DataFrame([[
            time, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
            v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
            v21, v22, v23, v24, v25, v26, v27, v28, amount
        ]], columns=[
            'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
            'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
            'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
        ])

        # Scale Time and Amount
        input_data[['Time', 'Amount']] = scaler.transform(
            input_data[['Time', 'Amount']]
        )

        # Predict
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0][1]

        st.divider()

        if prediction == 1:
            st.error(f'Fraudulent Transaction Detected')
            st.write(f'Fraud Probability: **{probability * 100:.2f}%**')
        else:
            st.success(f'Legitimate Transaction')
            st.write(f'Fraud Probability: **{probability * 100:.2f}%**')

# ── CSV Upload ────────────────────────────────────────────────────────────────
else:

    st.subheader('Upload CSV File')
    st.write('CSV must contain columns: Time, V1–V28, Amount')

    uploaded_file = st.file_uploader('Choose a CSV file', type='csv')

    if uploaded_file is not None:

        df = pd.read_csv(uploaded_file)

        st.write(f'Loaded {len(df)} transactions')
        st.dataframe(df.head())

        if st.button('Run Predictions'):

            # Scale Time and Amount
            df_scaled = df.copy()
            df_scaled[['Time', 'Amount']] = scaler.transform(
                df_scaled[['Time', 'Amount']]
            )

            # Drop Class column if present
            features = df_scaled.drop(columns=['Class'], errors='ignore')

            # Predict
            predictions  = model.predict(features)
            probabilities = model.predict_proba(features)[:, 1]

            # Add results to dataframe
            df['Prediction'] = predictions
            df['Fraud Probability (%)'] = (probabilities * 100).round(2)
            df['Result'] = df['Prediction'].map({0: 'Legitimate', 1: 'Fraud'})

            st.divider()

            # Summary
            fraud_count = int(df['Prediction'].sum())
            legit_count = len(df) - fraud_count

            col1, col2, col3 = st.columns(3)
            col1.metric('Total Transactions', len(df))
            col2.metric('Legitimate', legit_count)
            col3.metric('Fraudulent', fraud_count)

            st.divider()

            # Results table
            st.subheader('Prediction Results')
            st.dataframe(
                df[['Time', 'Amount', 'Fraud Probability (%)', 'Result']]
            )

            # Download results
            csv = df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label='Download Results as CSV',
                data=csv,
                file_name='fraud_predictions.csv',
                mime='text/csv'
            )

st.divider()
st.caption(f'Model: {model_name} | Credit Card Fraud Detection')