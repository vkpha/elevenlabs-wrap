import express from 'express';
import { storageService } from '../lib/storageService.js';
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
 * Check if user has cached wrapped data
 * GET /wrapped/check
 */
router.get('/check', requireAuth, async (req, res) => {
  try {
    const userId = req.session.spotifyUserId;

    if (!userId) {
      return res.json({
        hasCachedData: false,
        message: 'User ID not found in session'
      });
    }

    const hasCachedData = storageService.hasUserWrappedData(userId);

    res.json({
      hasCachedData,
      userId
    });
  } catch (error) {
    console.error('Error checking cached data:', error);
    res.status(500).json({
      error: 'Failed to check cached data',
      details: error.message
    });
  }
});

/**
 * Get user's cached wrapped data
 * GET /wrapped/cached
 */
router.get('/cached', requireAuth, async (req, res) => {
  try {
    const userId = req.session.spotifyUserId;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID not found in session'
      });
    }

    const cachedData = await storageService.getUserWrappedData(userId);

    if (!cachedData) {
      return res.status(404).json({
        error: 'No cached data found',
        message: 'Please generate your wrapped first'
      });
    }

    res.json({
      success: true,
      data: cachedData
    });
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    res.status(500).json({
      error: 'Failed to retrieve cached data',
      details: error.message
    });
  }
});

/**
 * Clear user's cached data (force regeneration)
 * DELETE /wrapped/cache
 */
router.delete('/cache', requireAuth, async (req, res) => {
  try {
    const userId = req.session.spotifyUserId;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID not found in session'
      });
    }

    await storageService.clearUserCache(userId);

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      details: error.message
    });
  }
});

export default router;
