import express from 'express';
import { aiAnalysisService } from '../modules/ai-analysis/aiAnalysisService.js';
import { spotifyStatsService } from '../modules/wrap-stats/spotifyStatsService.js';

const router = express.Router();

/**
 * Middleware to check authentication
 */
const requireAuth = (req, res, next) => {
  if (!spotifyStatsService.isAuthenticated(req.session)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

/**
 * Guess user's music age based on their listening data
 * POST /ai/guess-music-age
 */
router.post('/guess-music-age', requireAuth, async (req, res) => {
  try {
    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return res.status(500).json({
        error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file.'
      });
    }

    const result = await aiAnalysisService.guessMusicAge();

    res.json(result);
  } catch (error) {
    console.error('Error analyzing music age:', error.message);

    // Provide helpful error messages
    if (error.message.includes('No JSON data files found')) {
      return res.status(400).json({
        error: 'No music data found',
        message: 'Please save some music data first by using the "Save to JSON File" buttons for top artists, top tracks, or recently played.'
      });
    }

    if (error.message.includes('Data directory not found')) {
      return res.status(400).json({
        error: 'No music data found',
        message: 'Please save some music data first by using the "Save to JSON File" buttons for top artists, top tracks, or recently played.'
      });
    }

    res.status(500).json({
      error: 'Failed to analyze music age',
      message: error.message
    });
  }
});

export default router;
