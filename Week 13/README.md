# Week 13 - Dashboard Visualization

React dashboard for daily activity trends, powered by a Node.js backend that decrypts wearable data from MongoDB.

## Stack

- Backend: Express + Mongoose
- Frontend: React (Vite) + Recharts
- Database URI base: `mongodb://localhost:27017/`

## Project Structure

- `backend/`: API that reads encrypted wearable records and returns decrypted trend data
- `frontend/`: React dashboard UI with charts and recent readings table

## Backend Setup

1. Open terminal in `Week 13/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`
4. Ensure values are set:
   - `MONGO_URI=mongodb://localhost:27017/`
   - `MONGO_DB_NAME=week13_dashboard` (or your DB name containing `wearablereadings`)
   - `ENCRYPTION_KEY=<same key used during data encryption>`
5. Run backend:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:5002` by default.

## Frontend Setup

1. Open terminal in `Week 13/frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Optional: create `.env` with API base URL:
   ```bash
   VITE_API_BASE_URL=http://localhost:5002/api
   ```
4. Run frontend:
   ```bash
   npm run dev
   ```

## API Endpoint

- Health: `GET /api/health`
- Daily trends: `GET /api/activity/daily-trends?days=14&deviceId=watch-101`

### Daily Trends Response Shape

```json
{
  "summary": {
    "daysRequested": 14,
    "deviceFilter": null,
    "recordsFetched": 72,
    "recordsDecrypted": 70,
    "firstDate": "2026-03-01",
    "lastDate": "2026-03-12"
  },
  "dailyTrends": [
    {
      "date": "2026-03-01",
      "totalSteps": 4132,
      "avgHeartRate": 82.4,
      "readings": 6
    }
  ],
  "recentReadings": [
    {
      "id": "...",
      "deviceId": "watch-101",
      "timestamp": "2026-03-12T10:20:11.000Z",
      "heartRate": 85,
      "steps": 5321
    }
  ]
}
```

## Notes

- Dashboard expects encrypted records in `wearablereadings` collection with fields:
  `deviceId`, `encryptedPayload`, `iv`, `authTag`, `receivedAt`.
- If `ENCRYPTION_KEY` does not match the key used at ingestion time, records cannot be decrypted and are skipped.
