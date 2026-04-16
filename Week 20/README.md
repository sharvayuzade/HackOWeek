# Week 20 - SIT Admission App

Simple full-stack admission portal template for GitHub uploads, local demos, and cloud deployment practice.

## What It Includes

- Express backend with a small REST API
- Static frontend served from the same app
- Local JSON persistence for demo submissions
- HTTPS redirect and security headers in production
- Rate limiting for basic multi-user protection
- GitHub Actions CI/CD sample
- Heroku-friendly `Procfile`

## Run Locally

1. Open `Week 20/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` if you want to override defaults
4. Start the app:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000`

## API

- `GET /api/health`
- `GET /api/applications`
- `GET /api/stats`
- `POST /api/applications`

## Deployment Notes

- Heroku: use the `Procfile` in `Week 20/backend` and set `PORT`, `NODE_ENV`, and your Heroku app secrets.
- GitHub Actions: set the repository variable `ENABLE_HEROKU_DEPLOY=true` only if you want the Heroku deploy job to run.
- AWS: the same app can run on Elastic Beanstalk or ECS. The code is HTTP-only in development and forces HTTPS in production when a proxy is present.
- Scalability: the app is stateless except for the demo JSON store. Swap `backend/src/store.js` for a managed database when you move from template to production.

## Folder Layout

- `backend/` - Node.js server and storage layer
- `frontend/` - HTML, CSS, and browser-side JavaScript