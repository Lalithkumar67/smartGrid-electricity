# ⚡ SmartGrid Substation Load Optimization & Outage Analytics

> A full-stack Smart Grid platform for monitoring substation loads, predicting overload conditions, optimizing power distribution, and analyzing power outages.

## 📌 Overview

Electricity boards often face challenges in balancing electrical loads across substations. Uneven load distribution can lead to transformer overloads, unexpected outages, inefficient energy utilization, and delayed response to critical conditions.

**SmartGrid Substation Load Optimization & Outage Analytics** provides a centralized platform to monitor substations, analyze electrical parameters, identify overload risks, predict future load conditions, and recommend optimal load redistribution.

## 🎯 Objectives

- Monitor substation performance and electrical parameters
- Detect overloaded and high-risk substations
- Predict potential future overload conditions
- Optimize load distribution between substations
- Analyze historical power outages
- Provide actionable alerts and recommendations
- Improve grid reliability and infrastructure utilization

## ✨ Features

### 📊 Substation Monitoring
- Real-time/current load monitoring
- Transformer capacity tracking
- Voltage, current and frequency monitoring
- Transformer temperature monitoring
- Substation health status

### ⚠️ Overload Detection
Automatically calculates:

`Load Utilization = (Current Load / Capacity) × 100`

| Utilization | Status |
|---|---|
| < 70% | 🟢 Normal |
| 70–90% | 🟡 Warning |
| 90–100% | 🟠 Critical |
| > 100% | 🔴 Overloaded |

### 🔮 Load Prediction
Uses historical load patterns and current measurements to estimate future demand and identify substations at risk of overload.

### ⚡ Power Distribution Optimization
Provides recommendations for transferring load from overloaded substations to nearby substations with available capacity.

### 🚨 Alert Management
Supports alerts for:
- Overload conditions
- Predicted overload
- Abnormal voltage
- High transformer temperature
- Sudden load increases
- Substation failures
- Power outages

### 📈 Outage Analytics
Provides analytics for:
- Total outages
- Outage duration
- Outages by substation
- Outage causes
- Most affected areas
- Historical outage trends

## 🏗️ System Architecture

```text
             Electrical / Simulated Data
                       │
                       ▼
              ┌─────────────────┐
              │  Node.js +      │
              │  Express.js API │
              └────────┬────────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      ┌──────────────┐     ┌──────────────┐
      │ PostgreSQL   │     │    Redis     │
      │ Historical   │     │ Latest Data  │
      │ Data         │     │ Cache        │
      └──────────────┘     └──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Analytics &     │
              │ Optimization    │
              ├─────────────────┤
              │ Overload        │
              │ Prediction      │
              │ Optimization    │
              │ Outage Analysis │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ React Dashboard │
              │ + TypeScript    │
              └─────────────────┘
