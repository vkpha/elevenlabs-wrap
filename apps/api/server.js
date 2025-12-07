import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import statsRoutes from './src/routes/statsRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import musicRoutes from './src/routes/musicRoutes.js';
import wrappedRoutes from './src/routes/wrappedRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration - only use 127.0.0.1
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'elevenlabs-wrap-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elevenlabs-wrap-api' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/stats', statsRoutes);
app.use('/ai', aiRoutes);
app.use('/music', musicRoutes);
app.use('/wrapped', wrappedRoutes);

// In production, serve static files from the frontend build
if (isProduction) {
  const staticPath = path.join(__dirname, '../web/build');
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // 404 handler for development (API-only mode)
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 ElevenLabs Wrapped API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /auth/login - Initiate Spotify OAuth`);
  console.log(`  GET  /auth/callback - OAuth callback`);
  console.log(`  POST /auth/logout - Logout`);
  console.log(`  GET  /auth/status - Check auth status`);
  console.log(`  GET  /stats/top-artists - Get top artists`);
  console.log(`  GET  /stats/top-tracks - Get top tracks`);
  console.log(`  GET  /stats/recently-played - Get recently played`);
  console.log(`  POST /stats/save-top-artists - Save top artists to file`);
  console.log(`  POST /stats/save-top-tracks - Save top tracks to file`);
  console.log(`  POST /stats/save-recently-played - Save recently played to file`);
  console.log(`  GET  /stats/user-profile - Get user profile`);
  console.log(`  POST /ai/guess-music-age - Guess music age using AI`);
  console.log(`  POST /music/generate - Generate music from prompts`);
  console.log(`  POST /music/generate-from-analysis - Generate music from analysis`);
});
