import express from 'express';
import { elevenLabsService } from '../modules/music-generation/elevenLabsService.js';
import { spotifyStatsService } from '../modules/wrap-stats/spotifyStatsService.js';
import { storageService } from '../lib/storageService.js';
import { aiAnalysisService } from '../modules/ai-analysis/aiAnalysisService.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    const userId = req.session.spotifyUserId;

    if (!analysis || !analysis.musicPrompts) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Please provide analysis with musicPrompts'
      });
    }

    const prompts = analysis.musicPrompts;
    const isPreview = duration <= 10;

    console.log(`\n🎵 Generating ${prompts.length} ${isPreview ? 'preview' : 'full'} tracks from analysis...`);
    if (userId) {
      console.log(`👤 User: ${userId}`);
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate tracks with specified duration (pass userId for user-specific storage)
    const result = await elevenLabsService.generateMultipleTracks(
      prompts,
      (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      },
      duration,
      userId
    );

    // Save complete wrapped data to user cache
    if (userId) {
      await storageService.saveUserWrappedData(userId, {
        analysis,
        trackResults: result.results,
        duration,
        generatedAt: new Date().toISOString()
      });
    }

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

/**
 * Get list of generated tracks (user-specific)
 * GET /music/tracks
 */
router.get('/tracks', requireAuth, async (req, res) => {
  try {
    const userId = req.session.spotifyUserId;

    // Determine which directory to read from
    let musicDir;
    if (userId) {
      musicDir = elevenLabsService.getUserMusicDir(userId);
    } else {
      // Fallback to legacy shared directory
      musicDir = join(__dirname, '../../.cache/generated-music');
    }

    const files = await readdir(musicDir);

    // Filter and sort mp3 files
    const tracks = files
      .filter(f => f.endsWith('.mp3'))
      .sort((a, b) => {
        // Extract track numbers from filenames like "track-1-preview-123456.mp3"
        const aMatch = a.match(/track-(\d+)/);
        const bMatch = b.match(/track-(\d+)/);
        const aNum = aMatch ? parseInt(aMatch[1]) : 0;
        const bNum = bMatch ? parseInt(bMatch[1]) : 0;
        return aNum - bNum;
      })
      .map(filename => ({
        filename,
        url: `/music/audio/${filename}`
      }));

    res.json({ tracks, userId });
  } catch (error) {
    console.error('Error reading tracks:', error.message);
    res.status(500).json({ error: 'Failed to read tracks' });
  }
});

/**
 * Serve audio files (user-specific)
 * GET /music/audio/:filename
 */
router.get('/audio/:filename', requireAuth, (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.session.spotifyUserId;

    // Determine which directory to serve from
    let musicDir;
    if (userId) {
      musicDir = elevenLabsService.getUserMusicDir(userId);
    } else {
      // Fallback to legacy shared directory
      musicDir = join(__dirname, '../../.cache/generated-music');
    }

    const filepath = join(musicDir, filename);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.sendFile(filepath);
  } catch (error) {
    console.error('Error serving audio:', error.message);
    res.status(404).json({ error: 'Audio file not found' });
  }
});

export default router;
