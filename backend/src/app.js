import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,          // e.g. http://localhost:5173
  'http://localhost:3000',
  'http://localhost:5173',
  'https://franilt-frontend.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser clients like Postman/curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

app.options('*', cors()); // preflight support

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Backend is running successfully',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;