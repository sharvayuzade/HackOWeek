# Week 14 - Data Encryption Pipeline

End-to-end encryption pipeline for incoming wearable JSON payloads.

## What This Implements

- Accepts incoming wearable JSON over REST
- Encrypts payload on arrival using `CryptoJS` (AES)
- Stores only ciphertext in MongoDB
- Uses local MongoDB by default (`mongodb://localhost:27017/week14_encryption_pipeline`)

## Folder Structure

- `backend/`: Express API + MongoDB persistence

## Backend Setup

1. Open terminal in `Week 14/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`
4. Start the API:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT=5002`
- `MONGO_URI=mongodb://localhost:27017/week14_encryption_pipeline`
- `ENCRYPTION_SECRET=replace-with-a-strong-secret`

## API Endpoints

- `GET /api/health`
- `POST /api/wearable/ingest`
- `GET /api/wearable/recent?limit=10`

## Sample Ingestion Payload

```json
{
  "deviceId": "watch-501",
  "heartRate": 86,
  "steps": 6342,
  "sleepHours": 7.2,
  "timestamp": "2026-03-12T09:10:00.000Z"
}
```

### Sample Request

```bash
curl -X POST http://localhost:5002/api/wearable/ingest \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"watch-501","heartRate":86,"steps":6342}'
```

The response returns metadata only. Encrypted ciphertext is stored in MongoDB.
