export const SPOTIFY_CONFIG = {
  BASE_URL: 'https://api.spotify.com/v1',
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-read',
    'user-read-playback-state',
    'user-read-currently-playing'
  ],
  TIME_RANGES: {
    SHORT_TERM: 'short_term',  // last 4 weeks
    MEDIUM_TERM: 'medium_term', // last 6 months
    LONG_TERM: 'long_term'      // all time
  },
  LIMITS: {
    MAX_ITEMS: 50
  }
};
