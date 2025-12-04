# AI Music Age Analysis Feature

This feature uses Claude AI (via Anthropic API) to analyze your Spotify listening data and guess your "music age" - a creative insight into what era or decade your music taste most closely aligns with.

## Setup

1. **Get an Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Create an API key
   - Add it to your `.env` file:
     ```
     ANTHROPIC_API_KEY=your-actual-api-key-here
     ```

2. **Install Dependencies**
   - Already done! The `@anthropic-ai/sdk` package is installed.

## How It Works

1. **Save Your Music Data**
   - Use the test page (http://127.0.0.1:3000/test.html)
   - Click the "💾 Save" buttons to save your:
     - Top Artists
     - Top Tracks
     - Recently Played tracks
   - These are saved as JSON files in `apps/api/data/`

2. **Guess Your Music Age**
   - Click the "🎯 Guess My Music Age" button
   - Claude will analyze the 3 most recent JSON files
   - You'll get back:
     - **Music Age**: A specific year or era (e.g., "1985", "Early 2000s")
     - **Match Percentage**: How strongly your taste aligns (0-100%)
     - **Era Description**: What that era represents
     - **Key Indicators**: Why you match this era
     - **Music Personality**: A fun personality type
     - **Vibe Check**: What your music taste says about you

## API Endpoint

### POST `/ai/guess-music-age`

**Authentication**: Required (must be logged in with Spotify)

**Request**: Empty POST

**Response**:
```json
{
  "success": true,
  "analysis": {
    "musicAge": "1985",
    "matchPercentage": 87,
    "eraDescription": "The golden age of synth-pop and new wave",
    "keyIndicators": [
      "Heavy rotation of 80s synth-pop artists",
      "Preference for analog synthesizers",
      "Nostalgic for MTV era"
    ],
    "musicPersonality": "Synth Wave Nostalgic",
    "vibeCheck": "You're living in a neon-soaked dream of the 1980s."
  },
  "filesAnalyzed": [
    "top-artists-2024-12-03T10-30-00.json",
    "top-tracks-2024-12-03T10-28-00.json",
    "recently-played-2024-12-03T10-25-00.json"
  ],
  "timestamp": "2024-12-03T10:35:00.000Z"
}
```

**Error Cases**:
- `401`: Not authenticated
- `400`: No music data files found (need to save data first)
- `500`: API key not configured or other error

## Architecture

Following the project architecture from `/docs`:

```
apps/api/
├── src/
│   ├── modules/
│   │   └── ai-analysis/
│   │       └── aiAnalysisService.js  # Claude AI integration
│   └── routes/
│       └── aiRoutes.js               # API endpoints for AI features
└── data/                             # Stored JSON files (created automatically)
```

## Claude Model Used

- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 2048
- **Purpose**: Creative analysis and insight generation

## Future Enhancements

- Save analysis results to database
- Compare music age over time
- Generate shareable music age cards
- Add more analysis types (mood analysis, genre diversity, etc.)
