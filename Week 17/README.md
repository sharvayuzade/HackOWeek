# Week 17 - User Data Export Feature

Secure CSV/PDF export service for analyzed wearable data.

## What This Implements

- Stores analyzed records in encrypted form in MongoDB
- Decrypts records on-the-fly only during read/export
- Exports analysis reports as CSV and PDF
- Highlights anomalies in UI and export outputs
- Protects export endpoints with token-based authorization

## Stack

- Backend: Node.js, Express, Mongoose, PDFKit
- Frontend: React + TypeScript (Vite)
- Database: MongoDB (`mongodb://localhost:27017/`)

## Folder Structure

- `backend/`: API, encryption, demo seeding, secure exports
- `frontend/`: dashboard for previewing data and downloading reports

## Quick Start

1. Open terminal in `Week 17/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`
4. Build frontend bundle:
   ```bash
   cd ../frontend
   npm install
   npm run build
   cd ../backend
   ```
5. Start backend:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:5017`

## Frontend Dev Mode (Optional)

For React development with hot reload:

```bash
cd Week 17/frontend
npm run dev
```

Vite runs on `http://localhost:5177` and proxies API requests to `http://localhost:5017`.

## Environment Variables

- `PORT=5017`
- `MONGO_URI=mongodb://localhost:27017/`
- `MONGO_DB_NAME=week17_user_data_export`
- `ENCRYPTION_SECRET=demo-week17-encryption-secret`
- `EXPORT_TOKEN=week17-secure-token`
- `ANOMALY_SCORE_THRESHOLD=0.75`
- `AUTO_SEED_DEMO=true`

## API Endpoints

- `GET /api/health`
- `POST /api/data/ingest`
- `GET /api/data/recent?limit=25`
- `POST /api/demo/seed`
- `GET /api/export/csv` (requires `Authorization: Bearer <token>`)
- `GET /api/export/pdf` (requires `Authorization: Bearer <token>`)

## Example Ingestion Payload

```json
{
  "deviceId": "watch-301",
  "bpm": 129,
  "steps": 6700,
  "stressIndex": 0.68,
  "anomalyScore": 0.82,
  "capturedAt": "2026-03-14T10:05:00.000Z"
}
```

## Demo Notes

- Use token `week17-secure-token` in the dashboard for exports.
- Anomalies are highlighted when `anomalyScore >= ANOMALY_SCORE_THRESHOLD`.