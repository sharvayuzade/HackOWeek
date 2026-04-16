import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApplicationStore } from './store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const store = createApplicationStore(path.join(backendRoot, 'data', 'applications.json'));
const app = express();
const port = Number(process.env.PORT || 5000);
const production = process.env.NODE_ENV === 'production';

if (production) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:'],
        'script-src': ["'self'"],
        'connect-src': ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

if (production) {
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (req.secure || forwardedProto === 'https') {
      return next();
    }

    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });

  app.use(
    helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    })
  );
}

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getStats(applications) {
  return applications.reduce(
    (accumulator, application) => {
      const course = application.course || 'Unknown';
      accumulator.byCourse[course] = (accumulator.byCourse[course] || 0) + 1;
      return accumulator;
    },
    { byCourse: {} }
  );
}

app.get('/api/health', async (_req, res) => {
  const applications = await store.listApplications();
  res.json({
    status: 'ok',
    service: 'SIT Admission App',
    timestamp: new Date().toISOString(),
    totalApplications: applications.length,
  });
});

app.get('/api/applications', async (_req, res, next) => {
  try {
    const applications = await store.listApplications();
    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

app.get('/api/stats', async (_req, res, next) => {
  try {
    const applications = await store.listApplications();
    const { byCourse } = getStats(applications);

    res.json({
      total: applications.length,
      byCourse,
      latestApplication: applications[0] || null,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/applications', async (req, res, next) => {
  try {
    const fullName = cleanText(req.body.fullName);
    const email = cleanText(req.body.email).toLowerCase();
    const phone = cleanText(req.body.phone);
    const course = cleanText(req.body.course);
    const intakeTerm = cleanText(req.body.intakeTerm);
    const statement = cleanText(req.body.statement);

    if (!fullName || !email || !course || !intakeTerm || !statement) {
      return res.status(400).json({
        error: 'fullName, email, course, intakeTerm, and statement are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const application = await store.addApplication({
      fullName,
      email,
      phone,
      course,
      intakeTerm,
      statement,
    });

    return res.status(201).json({
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(frontendRoot));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`SIT Admission App running on http://localhost:${port}`);
});