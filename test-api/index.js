import 'dotenv/config';
import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function getRecentlyPlayedTracks(accessToken) {
  const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching recently played tracks:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🎵 Fetching your last 50 recently played songs from Spotify...\n');

  try {
    const accessToken = await getAccessToken();
    console.log('✓ Successfully authenticated with Spotify\n');

    const data = await getRecentlyPlayedTracks(accessToken);

    console.log(`Found ${data.items.length} recently played tracks:\n`);
    console.log('=' .repeat(80));

    data.items.forEach((item, index) => {
      const track = item.track;
      const artists = track.artists.map(artist => artist.name).join(', ');
      const playedAt = new Date(item.played_at).toLocaleString();

      console.log(`\n${index + 1}. ${track.name}`);
      console.log(`   Artist(s): ${artists}`);
      console.log(`   Album: ${track.album.name}`);
      console.log(`   Played at: ${playedAt}`);
      console.log(`   Duration: ${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✓ Successfully fetched ${data.items.length} tracks!`);

  } catch (error) {
    console.error('\n❌ Failed to fetch recently played tracks');
    process.exit(1);
  }
}

main();
