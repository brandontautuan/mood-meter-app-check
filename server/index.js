// server/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import moodsRouter from './routes/moods.js';
import purpleairRouter from './routes/purpleair.js';

const app = express();

// Use PORT from .env, fall back to 4001 (your apps point here)
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());             // built-in JSON parser (no body-parser needed)

// Health check (so /api/health doesn’t say "Cannot GET")
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Your existing routes
app.use('/api/moods', moodsRouter);
app.use('/api/purpleair', purpleairRouter);

// Root endpoint (kept from your file)
app.get('/', (_req, res) => {
  res.send('Mood Meter API is running.');
});

// Start server (0.0.0.0 so it's reachable in containers / deployed hosts)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
