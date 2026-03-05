# Week 12 - Wearable Data Ingestion

Real-time ingestion service for wearable telemetry using WebSockets.

## Features

- WebSocket endpoint for heart rate and steps ingestion
- AES-256-GCM encryption before MongoDB insert
- MongoDB persistence for encrypted records

## Backend Setup

1. Open terminal in `Week 12/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`
4. Ensure these values are set:
   - `MONGO_URI` (reuse your existing MongoDB URI string)
   - `ENCRYPTION_KEY` (64 hex chars)
5. Run:
   ```bash
   npm run dev
   ```

## Endpoints

- Health: `GET /api/health`
- WebSocket ingestion: `ws://localhost:5001/ws/wearable`

## Incoming WebSocket Payload

```json
{
  "deviceId": "watch-101",
  "heartRate": 82,
  "steps": 4512,
  "timestamp": "2026-03-05T08:12:00.000Z"
}
```

`timestamp` is optional. If omitted, server timestamp is used.

## Quick Test Client

From `Week 12/backend`, after starting the server:

```bash
npm run test:ws
```

Optional environment overrides:

```bash
WS_URL=ws://localhost:5001/ws/wearable DEVICE_ID=watch-202 HEART_RATE=88 STEPS=5000 npm run test:ws
```