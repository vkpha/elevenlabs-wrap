import axios from 'axios';
import { SPOTIFY_CONFIG } from '../../config/spotify.js';
import { spotifyStatsService } from '../wrap-stats/spotifyStatsService.js';

/**
 * Authentication service for Spotify OAuth flow
 */
class AuthService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.REDIRECT_URI || 'http://127.0.0.1:3001/auth/callback';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
  }

  /**
   * Generate Spotify authorization URL
   */
  getAuthorizationUrl() {
    const scope = SPOTIFY_CONFIG.SCOPES.join(' ');
    return `${SPOTIFY_CONFIG.AUTH_URL}?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code) {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(
      SPOTIFY_CONFIG.TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }

  /**
   * Authenticate user and store tokens in session
   */
  async authenticateUser(session, code) {
    const tokens = await this.exchangeCodeForToken(code);
    spotifyStatsService.setTokens(session, tokens.accessToken, tokens.refreshToken);

    // Fetch and store user profile (including Spotify user ID)
    const userProfile = await spotifyStatsService.getUserProfile(session);
    session.spotifyUserId = userProfile.id;
    session.spotifyDisplayName = userProfile.display_name;

    console.log(`✅ Authenticated user: ${userProfile.display_name} (${userProfile.id})`);

    return tokens;
  }

  /**
   * Logout user by destroying session
   */
  async logoutUser(session) {
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          reject(new Error('Failed to logout'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(session) {
    return spotifyStatsService.isAuthenticated(session);
  }
}

export const authService = new AuthService();
