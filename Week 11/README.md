# Week 11 - JWT Auth + Encrypted Wearable Profile Sync

This week contains a full-stack implementation with:
- Frontend login/signup interface
- JWT-based authentication
- Refresh token rotation and logout revocation
- Backend API with MongoDB
- AES-256-GCM encrypted wearable profile storage
- Auth rate limiting for brute-force protection

## Folder Structure

- `backend/` - Express + MongoDB API
- `frontend/` - HTML/CSS/JS client

## Backend Setup

1. Open terminal in `Week 11/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`
4. Use Mongo URI (local):
   ```
   MONGO_URI=mongodb://localhost:27017/week11_wearable_auth
   ```
   You can also set it to `mongodb://localhost:27017/` if your MongoDB instance handles DB selection elsewhere.
5. Set secure values for:
   - `JWT_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `ENCRYPTION_KEY` (64 hex chars)
6. Start backend:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open `Week 11/frontend/index.html` in browser.
2. Ensure backend is running on port `5000`.
3. Use Signup or Login to receive JWT.
4. Sync wearable profile data from the sync form.
5. Click `Fetch Latest Synced Profile` to view decrypted data from API.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/profiles/sync` (Bearer token required)
- `GET /api/profiles/latest` (Bearer token required)
- `GET /api/health`

## Security Notes

- User passwords are hashed using `bcryptjs`.
- Access JWT is required for profile sync/retrieval.
- Refresh tokens are rotated on `/api/auth/refresh` and revoked on `/api/auth/logout`.
- `/api/auth/*` routes are protected by request rate limiting.
- Wearable profile payload is encrypted at rest using AES-256-GCM before saving in MongoDB.
