import axios from 'axios';
import { SPOTIFY_CONFIG } from '../../config/spotify.js';

/**
 * Service for fetching and processing Spotify listening statistics
 * Used for generating Wrapped-style insights
 */
class SpotifyStatsService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(session) {
    return !!session?.accessToken;
  }

  /**
   * Set user tokens in session
   */
  setTokens(session, accessToken, refreshToken) {
    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
  }

  /**
   * Get access token from session
   */
  getAccessToken(session) {
    return session?.accessToken;
  }

  /**
   * Get refresh token from session
   */
  getRefreshToken(session) {
    return session?.refreshToken;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(session) {
    const refreshToken = this.getRefreshToken(session);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(
      SPOTIFY_CONFIG.TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    session.accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      session.refreshToken = response.data.refresh_token;
    }

    return session.accessToken;
  }

  /**
   * Make authenticated request to Spotify API
   */
  async makeAuthenticatedRequest(session, endpoint, params = {}) {
    if (!this.isAuthenticated(session)) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get(`${SPOTIFY_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken(session)}`
        },
        params
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401 && this.getRefreshToken(session)) {
        await this.refreshAccessToken(session);

        const retryResponse = await axios.get(`${SPOTIFY_CONFIG.BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken(session)}`
          },
          params
        });

        return retryResponse.data;
      }

      throw error;
    }
  }

  /**
   * Fetch top artists for a given time range
   */
  async getTopArtists(session, timeRange = SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM, limit = SPOTIFY_CONFIG.LIMITS.MAX_ITEMS) {
    return this.makeAuthenticatedRequest(session, '/me/top/artists', {
      time_range: timeRange,
      limit
    });
  }

  /**
   * Fetch top tracks for a given time range
   */
  async getTopTracks(session, timeRange = SPOTIFY_CONFIG.TIME_RANGES.SHORT_TERM, limit = SPOTIFY_CONFIG.LIMITS.MAX_ITEMS) {
    return this.makeAuthenticatedRequest(session, '/me/top/tracks', {
      time_range: timeRange,
      limit
    });
  }

  /**
   * Fetch recently played tracks
   */
  async getRecentlyPlayed(session, limit = SPOTIFY_CONFIG.LIMITS.MAX_ITEMS) {
    return this.makeAuthenticatedRequest(session, '/me/player/recently-played', {
      limit
    });
  }

  /**
   * Fetch user profile information
   */
  async getUserProfile(session) {
    return this.makeAuthenticatedRequest(session, '/me');
  }
}

export const spotifyStatsService = new SpotifyStatsService();
