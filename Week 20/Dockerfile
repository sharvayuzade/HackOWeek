FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "start"]