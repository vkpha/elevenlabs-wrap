# ElevenLabs Music Generation

## Setup

1. **Get ElevenLabs API Key**:
   - Go to https://elevenlabs.io/
   - Sign up and get your API key
   - Add to `.env`:
     ```
     ELEVENLABS_API_KEY=your-actual-api-key-here
     ```

2. **Install Dependencies** (already done):
   ```bash
   npm install @elevenlabs/elevenlabs-js
   ```

## How It Works

### Flow:
1. User logs in with Spotify
2. AI analyzes music and generates 10 custom prompts
3. User clicks "Generate 10 Songs with ElevenLabs"
4. Backend generates each track (22 seconds each)
5. Tracks saved to `.cache/generated-music/`
6. Real-time progress updates via Server-Sent Events (SSE)

### API Endpoints:

#### POST `/music/generate`
Generate music from custom prompts
```json
{
  "prompts": [
    "An upbeat synth-pop track with retro 80s vibes...",
    "A melancholic indie ballad..."
  ]
}
```

#### POST `/music/generate-from-analysis`
Generate music from AI analysis results
```json
{
  "analysis": {
    "musicPrompts": ["...10 prompts..."]
  }
}
```

### Generated Files:

**Location**: `apps/api/.cache/generated-music/`

**Format**:
- `track-1-1701234567890.mp3`
- `track-2-1701234567890.mp3`
- etc.

**Duration**: Up to 120 seconds (2 minutes) per track*

*Note: ElevenLabs API may cap duration based on your plan. Free tier typically supports up to 22 seconds, paid plans support longer durations.

## Usage

### Automated Flow Page:
```
http://127.0.0.1:3000/auto-flow.html
```

1. Login with Spotify
2. Wait for AI analysis
3. Click "Generate 10 Songs with ElevenLabs"
4. Watch real-time progress
5. Files saved automatically

### Manual API Call:
```javascript
const response = await fetch('http://127.0.0.1:3001/music/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    prompts: [
      "Upbeat pop track with catchy hooks",
      "Chill lo-fi beats for studying"
    ]
  })
});

// Handle SSE stream
const reader = response.body.getReader();
// ... (see auto-flow.html for full example)
```

## Features

- ✅ Real-time progress updates (SSE)
- ✅ Parallel generation with rate limiting
- ✅ Error handling per track
- ✅ Automatic file naming
- ✅ Cache directory (git-ignored)
- ✅ Success/failure tracking

## Rate Limiting

- 1 second delay between requests
- Max 10 tracks per request
- Handles ElevenLabs API rate limits

## Storage

Generated music stored in:
```
apps/api/.cache/generated-music/
├── track-1-timestamp.mp3
├── track-2-timestamp.mp3
└── ...
```

**Note**: This directory is git-ignored and can be deleted anytime.

## Error Handling

- API key not configured → Clear error message
- Generation fails → Individual track marked as failed
- Network issues → Retry mechanism
- Rate limiting → Automatic delays

## Cost Estimate

**ElevenLabs Pricing** (as of Dec 2024):
- Free tier: 10,000 characters/month
- Paid: ~$1 per 1000 characters

**Per generation**:
- 10 tracks × ~100 characters = ~1000 characters
- Cost: ~$0.10 per full generation (paid tier)

## Production Considerations

1. **Storage**: Move to S3/Cloud Storage
2. **Queue**: Use job queue (Bull, BullMQ) for large batches
3. **Streaming**: Stream directly to client instead of saving
4. **CDN**: Serve generated files via CDN
5. **Database**: Track generations in database
6. **Webhooks**: Use ElevenLabs webhooks for async generation

## Example Prompts

The AI generates prompts like:
```
1. "An energetic dance-pop track with pulsing synths and a catchy four-on-the-floor beat.
   Perfect for a night out or workout session."

2. "A dreamy indie-pop ballad featuring acoustic guitar and ethereal vocals.
   Ideal for late-night reflection or a cozy coffee shop vibe."

3. "An upbeat EDM banger with festival-ready drops and euphoric melodies.
   Built for dancing and good vibes."
```

## Troubleshooting

**Error: API key not configured**
- Add `ELEVENLABS_API_KEY` to `.env`
- Restart server

**Error: 401 Unauthorized**
- Check API key is valid
- Verify account has available credits

**Error: Files not found**
- Check `.cache/generated-music/` exists
- Verify file permissions

**Slow generation**
- Normal: ~10-15 seconds per track (2 minutes each)
- Total: ~2-3 minutes for 10 tracks
