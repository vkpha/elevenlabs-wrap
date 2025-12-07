import express from 'express';
import { spotifyStatsService } from '../modules/wrap-stats/spotifyStatsService.js';
import { storageService } from '../lib/storageService.js';
import { SPOTIFY_CONFIG } from '../config/spotify.js';

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
 * Get top artists
 * GET /stats/top-artists?time_range=short_term&limit=50
 */
router.get('/top-artists', requireAuth, async (req, res) => {
  try {
    const timeRange = req.query.time_range || SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM;
    const limit = parseInt(req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;

    const data = await spotifyStatsService.getTopArtists(req.session, timeRange, limit);

    res.json({
      success: true,
      timeRange,
      timeRangeDescription: storageService.getTimeRangeDescription(timeRange),
      itemCount: data.items?.length || 0,
      data
    });
  } catch (error) {
    console.error('Error fetching top artists:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to fetch top artists'
    });
  }
});

/**
 * Get top tracks
 * GET /stats/top-tracks?time_range=short_term&limit=50
 */
router.get('/top-tracks', requireAuth, async (req, res) => {
  try {
    const timeRange = req.query.time_range || SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM;
    const limit = parseInt(req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;

    const data = await spotifyStatsService.getTopTracks(req.session, timeRange, limit);

    res.json({
      success: true,
      timeRange,
      timeRangeDescription: storageService.getTimeRangeDescription(timeRange),
      itemCount: data.items?.length || 0,
      data
    });
  } catch (error) {
    console.error('Error fetching top tracks:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to fetch top tracks'
    });
  }
});

/**
 * Get recently played tracks
 * GET /stats/recently-played?limit=50
 */
router.get('/recently-played', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;

    const data = await spotifyStatsService.getRecentlyPlayed(req.session, limit);

    res.json({
      success: true,
      itemCount: data.items?.length || 0,
      data
    });
  } catch (error) {
    console.error('Error fetching recently played:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to fetch recently played tracks'
    });
  }
});

/**
 * Save top artists to JSON file
 * POST /stats/save-top-artists
 */
router.post('/save-top-artists', requireAuth, async (req, res) => {
  try {
    const timeRange = req.body?.time_range || req.query.time_range || SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM;
    const limit = parseInt(req.body?.limit || req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;
    const userId = req.session.spotifyUserId;

    const data = await spotifyStatsService.getTopArtists(req.session, timeRange, limit);
    const result = await storageService.saveTopArtists(data, timeRange, userId);

    res.json({
      success: true,
      message: 'Top artists saved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error saving top artists:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to save top artists'
    });
  }
});

/**
 * Save top tracks to JSON file
 * POST /stats/save-top-tracks
 */
router.post('/save-top-tracks', requireAuth, async (req, res) => {
  try {
    const timeRange = req.body?.time_range || req.query.time_range || SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM;
    const limit = parseInt(req.body?.limit || req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;
    const userId = req.session.spotifyUserId;

    const data = await spotifyStatsService.getTopTracks(req.session, timeRange, limit);
    const result = await storageService.saveTopTracks(data, timeRange, userId);

    res.json({
      success: true,
      message: 'Top tracks saved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error saving top tracks:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to save top tracks'
    });
  }
});

/**
 * Save recently played tracks to JSON file
 * POST /stats/save-recently-played
 */
router.post('/save-recently-played', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.body?.limit || req.query.limit) || SPOTIFY_CONFIG.LIMITS.MAX_ITEMS;
    const userId = req.session.spotifyUserId;

    const data = await spotifyStatsService.getRecentlyPlayed(req.session, limit);
    const result = await storageService.saveRecentlyPlayed(data, userId);

    res.json({
      success: true,
      message: 'Recently played tracks saved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error saving recently played:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to save recently played tracks'
    });
  }
});

/**
 * Get user profile
 * GET /stats/user-profile
 */
router.get('/user-profile', requireAuth, async (req, res) => {
  try {
    const data = await spotifyStatsService.getUserProfile(req.session);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch user profile'
    });
  }
});

export default router;
