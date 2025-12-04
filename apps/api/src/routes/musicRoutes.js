import express from 'express';
import { elevenLabsService } from '../modules/music-generation/elevenLabsService.js';
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
 * Generate music tracks from prompts
 * POST /music/generate
 * Body: { prompts: string[] }
 */
router.post('/generate', requireAuth, async (req, res) => {
  try {
    // Check if ElevenLabs API key is configured
    if (!elevenLabsService.isConfigured()) {
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please add ELEVENLABS_API_KEY to your .env file.'
      });
    }

    const { prompts } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide an array of prompts'
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        error: 'Too many prompts',
        message: 'Maximum 10 prompts allowed per request'
      });
    }

    console.log(`\n🎵 Received request to generate ${prompts.length} tracks`);

    // Set up SSE for real-time progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate tracks with progress updates
    const result = await elevenLabsService.generateMultipleTracks(
      prompts,
      (progress) => {
        // Send progress update to client
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      }
    );

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'complete', ...result })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error generating music:', error.message);
    res.status(500).json({
      error: 'Failed to generate music',
      message: error.message
    });
  }
});

/**
 * Generate music from analysis results (8-second previews by default)
 * POST /music/generate-from-analysis
 * Body: { analysis: { musicPrompts: string[] }, duration?: number }
 */
router.post('/generate-from-analysis', requireAuth, async (req, res) => {
  try {
    if (!elevenLabsService.isConfigured()) {
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please add ELEVENLABS_API_KEY to your .env file.'
      });
    }

    const { analysis, duration = 20 } = req.body;

    if (!analysis || !analysis.musicPrompts) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide analysis with musicPrompts'
      });
    }

    const prompts = analysis.musicPrompts;
    const isPreview = duration <= 10;

    console.log(`\n🎵 Generating ${prompts.length} ${isPreview ? 'preview' : 'full'} tracks from analysis...`);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate tracks with specified duration
    const result = await elevenLabsService.generateMultipleTracks(
      prompts,
      (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      },
      duration
    );

    res.write(`data: ${JSON.stringify({ type: 'complete', ...result })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error generating music:', error.message);
    res.status(500).json({
      error: 'Failed to generate music',
      message: error.message
    });
  }
});

/**
 * Generate full track from a single prompt
 * POST /music/expand-track
 * Body: { prompt: string, trackIndex: number }
 */
router.post('/expand-track', requireAuth, async (req, res) => {
  try {
    if (!elevenLabsService.isConfigured()) {
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please add ELEVENLABS_API_KEY to your .env file.'
      });
    }

    const { prompt, trackIndex } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide a prompt'
      });
    }

    console.log(`\n🎵 Expanding track ${trackIndex + 1} to full 120 seconds...`);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send start message
    res.write(`data: ${JSON.stringify({ type: 'start', trackIndex })}\n\n`);

    // Generate full 120-second track
    const result = await elevenLabsService.generateTrack(prompt, trackIndex, 120);

    // Send completion message
    res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error expanding track:', error.message);
    res.status(500).json({
      error: 'Failed to expand track',
      message: error.message
    });
  }
});

export default router;
