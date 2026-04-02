# Week 19 - Admin Compliance Panel

Simple admin panel for compliance monitoring of encrypted data access and anomaly reports.

## What This Implements

- Admin view for encrypted data access audit logs
- Admin view for anomaly reports
- Role-based access control (RBAC) on backend endpoints
- Basic React UI to test role access quickly

## Stack

- Frontend: React (Vite)
- Backend: Node.js, Express, Mongoose
- Database: MongoDB (`mongodb://localhost:27017/`)

## Folder Structure

- `backend/`: API, MongoDB models, RBAC middleware
- `frontend/`: React admin panel

## Quick Start

1. Start MongoDB locally.
2. Open terminal in `Week 19/backend` and install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`.
4. Start backend:
   ```bash
   npm run dev
   ```
5. Open another terminal in `Week 19/frontend` and install dependencies:
   ```bash
   npm install
   ```
6. Start frontend:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:5179`.

## Environment Variables

- `PORT=5019`
- `MONGO_URI=mongodb://localhost:27017/`
- `MONGO_DB_NAME=week19_admin_compliance`
- `AUTO_SEED_DEMO=true`

## API Endpoints

- `GET /api/health`
- `GET /api/admin/audit-logs` (admin only)
- `GET /api/admin/anomaly-reports` (admin only)
- `POST /api/admin/seed-demo`

## RBAC

Backend reads request headers:

- `x-user-id`
- `x-user-role`

Allowed roles for admin endpoints:

- `admin`

Requests from `viewer` or `auditor` are rejected with `403 Forbidden`.
