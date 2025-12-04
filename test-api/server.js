import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files (HTML frontend)
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎵 Spotify API Test Frontend running at http://127.0.0.1:${PORT}`);
  console.log(`\nMake sure the API server is running at http://127.0.0.1:3001`);
});
