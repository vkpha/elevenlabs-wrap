import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://127.0.0.1:3000/callback';

// Store tokens in memory (in production, use a database)
let accessToken = null;
let refreshToken = null;

app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Login route - redirects to Spotify authorization
app.get('/login', (req, res) => {
  const scope = 'user-read-recently-played';
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});

// Callback route - handles Spotify redirect
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    // Exchange code for tokens
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    res.redirect('/?success=true');
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    res.redirect('/?error=token_exchange_failed');
  }
});

// API route to get recently played tracks
app.get('/api/recently-played', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recently played:', error.response?.data || error.message);

    // If token expired, try to refresh
    if (error.response?.status === 401 && refreshToken) {
      try {
        await refreshAccessToken();
        // Retry the request
        const retryResponse = await axios.get(
          'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        return res.json(retryResponse.data);
      } catch (refreshError) {
        return res.status(401).json({ error: 'Token refresh failed' });
      }
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to fetch tracks'
    });
  }
});

// Helper function to refresh access token
async function refreshAccessToken() {
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
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

  accessToken = response.data.access_token;
  if (response.data.refresh_token) {
    refreshToken = response.data.refresh_token;
  }
}

// Check auth status
app.get('/api/auth-status', (req, res) => {
  res.json({ authenticated: !!accessToken });
});

// Save recently played tracks to JSON file
app.post('/api/save-tracks', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `recently-played-${timestamp}.json`;
    const filepath = join(__dirname, filename);

    await writeFile(filepath, JSON.stringify(response.data, null, 2));

    res.json({
      success: true,
      filename: filename,
      trackCount: response.data.items.length
    });
  } catch (error) {
    console.error('Error saving tracks:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to save tracks'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Spotify API Test Server running at http://127.0.0.1:${PORT}`);
  console.log(`\nVisit http://127.0.0.1:${PORT} to get started!`);
});
