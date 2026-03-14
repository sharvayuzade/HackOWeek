# Week 16 - Real-Time Alert System

Production-style real-time alerting service for campus wearable streams.

## What This Implements

- Monitors live stream readings over REST and simulated input
- Detects anomalies (high BPM)
- Pushes encrypted alert notifications to browser clients via Socket.IO
- Stores readings and alerts in MongoDB
- Ships with seeded demo data and presentation controls

## Stack

- Backend: Node.js, Express, Mongoose, Socket.IO
- Frontend: Vanilla HTML/CSS/JS dashboard served by backend
- Database: MongoDB (`mongodb://localhost:27017/`)

## Folder Structure

- `backend/`: API, stream processor, anomaly detection, encryption, Socket.IO
- `frontend/`: real-time dashboard and demo controls

## Quick Start

1. Open terminal in `Week 16/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`
4. Start server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5016` in browser

## Environment Variables

- `PORT=5016`
- `MONGO_URI=mongodb://localhost:27017/`
- `MONGO_DB_NAME=week16_realtime_alerts`
- `ENCRYPTION_SECRET=demo-week16-alert-secret`
- `BPM_ALERT_THRESHOLD=120`
- `AUTO_SEED_DEMO=true`

## API Endpoints

- `GET /api/health`
- `POST /api/stream/ingest`
- `GET /api/stream/recent?limit=20`
- `GET /api/alerts/recent?limit=20`
- `POST /api/demo/seed`
- `GET /api/demo/simulate/status`
- `POST /api/demo/simulate/start`
- `POST /api/demo/simulate/stop`

## Example Reading Payload

```json
{
  "deviceId": "watch-201",
  "bpm": 128,
  "spo2": 97,
  "temperature": 36.9,
  "capturedAt": "2026-03-14T09:15:00.000Z"
}
```

## Presentation Flow

1. Click `Seed Demo Data` once
2. Click `Start Live Simulator`
3. Observe encrypted notifications arriving in real time
4. Click `Inject High BPM Event` to trigger a deterministic anomaly