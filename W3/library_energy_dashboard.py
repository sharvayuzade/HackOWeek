
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import warnings
warnings.filterwarnings('ignore')

# Page configuration
st.set_page_config(
    page_title="Library Energy Dashboard",
    page_icon="📚",
    layout="wide"
)

# Title
st.title("📚 Library Energy During Exams Dashboard")
st.markdown("**Aggregated Historical Usage with Exponential Smoothing Forecasts**")

# Sidebar
st.sidebar.header("Settings")
forecast_weeks = st.sidebar.slider("Forecast Horizon (weeks)", 4, 16, 8)
seasonal_period = st.sidebar.selectbox("Seasonal Period", [13, 26, 52], index=0)
show_confidence = st.sidebar.checkbox("Show Historical Comparison", True)

# Generate synthetic data (same as notebook)
@st.cache_data
def generate_data():
    np.random.seed(42)
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2025, 12, 31)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    base_consumption = 450

    # Create academic calendar
    events = []
    for year in [2024, 2025]:
        for day in range(10, 22):
            events.append({'date': datetime(year, 3, day), 'event': 'Midterm Exams', 'multiplier': 1.6})
        for day in range(5, 20):
            events.append({'date': datetime(year, 5, day), 'event': 'Final Exams', 'multiplier': 1.8})
        for day in range(15, 28):
            events.append({'date': datetime(year, 10, day), 'event': 'Midterm Exams', 'multiplier': 1.6})
        for day in range(1, 15):
            events.append({'date': datetime(year, 12, day), 'event': 'Final Exams', 'multiplier': 1.8})
        for day in range(20, 32):
            try:
                events.append({'date': datetime(year, 12, day), 'event': 'Winter Break', 'multiplier': 0.3})
            except:
                pass
        for day in range(1, 10):
            events.append({'date': datetime(year, 1, day), 'event': 'Winter Break', 'multiplier': 0.3})
        for month in [6, 7]:
            for day in range(1, 29):
                try:
                    events.append({'date': datetime(year, month, day), 'event': 'Summer Break', 'multiplier': 0.5})
                except:
                    pass

    calendar_df = pd.DataFrame(events)
    calendar_df['date'] = pd.to_datetime(calendar_df['date'])
    calendar_df = calendar_df.drop_duplicates(subset='date', keep='first')

    data = []
    for date in dates:
        consumption = base_consumption
        day_of_week = date.dayofweek
        if day_of_week == 5:
            consumption *= 0.6
        elif day_of_week == 6:
            consumption *= 0.4
        month = date.month
        if month in [12, 1, 2]:
            consumption *= 1.25
        elif month in [6, 7, 8]:
            consumption *= 1.15

        calendar_match = calendar_df[calendar_df['date'] == date]
        if len(calendar_match) > 0:
            event = calendar_match.iloc[0]['event']
            multiplier = calendar_match.iloc[0]['multiplier']
            consumption *= multiplier
        else:
            event = 'Regular'

        noise = np.random.uniform(-0.10, 0.10)
        consumption *= (1 + noise)

        if 'Exam' in str(event):
            consumption += np.random.uniform(50, 100)

        data.append({
            'date': date,
            'energy_kwh': round(consumption, 2),
            'event': event,
            'is_exam_period': 'Exam' in str(event)
        })

    return pd.DataFrame(data)

# Load data
energy_df = generate_data()
weekly_energy = energy_df.set_index('date')['energy_kwh'].resample('W').mean()

# Fit model
@st.cache_resource
def fit_model(data, seasonal):
    model = ExponentialSmoothing(
        data,
        seasonal_periods=seasonal,
        trend='add',
        seasonal='mul',
        damped_trend=True
    )
    return model.fit(optimized=True)

fitted_model = fit_model(weekly_energy, seasonal_period)
forecast = fitted_model.forecast(steps=forecast_weeks)

# Calculate metrics
max_capacity = 800
next_exam_forecast = forecast.mean()
current_avg = weekly_energy[-13:].mean()
historical_exam_avg = energy_df[energy_df['is_exam_period']]['energy_kwh'].mean()
capacity_utilization = (next_exam_forecast / max_capacity) * 100

# Layout
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="Forecasted Weekly Avg",
        value=f"{next_exam_forecast:.1f} kWh",
        delta=f"{((next_exam_forecast - current_avg) / current_avg * 100):+.1f}%"
    )

with col2:
    st.metric(
        label="Current Avg",
        value=f"{current_avg:.1f} kWh"
    )

with col3:
    st.metric(
        label="Historical Exam Avg",
        value=f"{historical_exam_avg:.1f} kWh"
    )

with col4:
    st.metric(
        label="Capacity Utilization",
        value=f"{capacity_utilization:.1f}%"
    )

st.divider()

# Main content
left_col, right_col = st.columns([2, 1])

with left_col:
    st.subheader("Energy Forecast Timeline")

    fig_forecast = go.Figure()

    fig_forecast.add_trace(go.Scatter(
        x=weekly_energy.index,
        y=weekly_energy.values,
        mode='lines',
        name='Historical',
        line=dict(color='blue', width=2)
    ))

    fig_forecast.add_trace(go.Scatter(
        x=forecast.index,
        y=forecast.values,
        mode='lines',
        name='Forecast',
        line=dict(color='red', width=2, dash='dot')
    ))

    fig_forecast.update_layout(
        xaxis_title='Date',
        yaxis_title='Weekly Avg Energy (kWh)',
        template='plotly_white',
        height=400
    )

    st.plotly_chart(fig_forecast, use_container_width=True)

with right_col:
    st.subheader("Semester-End Forecast")

    fig_gauge = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=next_exam_forecast,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Energy (kWh/week)"},
        delta={'reference': current_avg, 'increasing': {'color': "red"}},
        gauge={
            'axis': {'range': [None, max_capacity]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, max_capacity * 0.5], 'color': 'lightgreen'},
                {'range': [max_capacity * 0.5, max_capacity * 0.75], 'color': 'yellow'},
                {'range': [max_capacity * 0.75, max_capacity], 'color': 'salmon'}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': max_capacity * 0.9
            }
        }
    ))

    fig_gauge.update_layout(height=350)
    st.plotly_chart(fig_gauge, use_container_width=True)

st.divider()

# Event comparison
if show_confidence:
    st.subheader("Energy by Academic Event")
    event_agg = energy_df.groupby('event')['energy_kwh'].mean().sort_values(ascending=False)

    fig_bar = px.bar(
        x=event_agg.index,
        y=event_agg.values,
        color=event_agg.values,
        color_continuous_scale='RdYlGn_r',
        labels={'x': 'Event Type', 'y': 'Avg Daily Energy (kWh)'}
    )
    fig_bar.update_layout(template='plotly_white', height=300, showlegend=False)
    st.plotly_chart(fig_bar, use_container_width=True)

# Footer
st.divider()
st.caption("Library Energy Analysis Dashboard | Powered by Holt-Winters Exponential Smoothing")
