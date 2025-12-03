# Testing Guide - AI Music Age Feature

## Prerequisites

1. **Anthropic API Key**: Already added to `apps/api/.env`
2. **Spotify App**: Redirect URI must be `http://127.0.0.1:3001/auth/callback`

## How to Test

### Step 1: Start Both Servers

**Terminal 1 - API Server (port 3001):**
```bash
cd apps/api
npm start
```

**Terminal 2 - Test Frontend (port 3000):**
```bash
cd test-api
npm start
```

### Step 2: Access Test Page

Open: http://127.0.0.1:3000/test.html

### Step 3: Login with Spotify

1. Click "Login with Spotify"
2. Authorize the app
3. You'll be redirected back to the test page

### Step 4: Save Your Music Data

**You need to save at least one JSON file (ideally all three):**

1. Click "💾 Save Top Artists to JSON" (in section B)
2. Click "💾 Save Top Tracks to JSON" (in section B)
3. Click "💾 Save to JSON File" (in section C - Recently Played)

**Success messages** will show the files were saved to `apps/api/data/`

### Step 5: Guess Your Music Age

1. Scroll to section D: "🤖 AI Music Analysis (Claude)"
2. Click "🎯 Guess My Music Age"
3. Wait for Claude to analyze (takes 5-10 seconds)
4. View your results!

## Expected Results

You should see a formatted JSON response with:

- **🎯 Music Age**: "1985", "Early 2000s", etc.
- **📊 Match Percentage**: 0-100%
- **✨ Era Description**: What that era represents
- **🔑 Key Indicators**: Why you match this era
- **🎭 Music Personality**: Your music personality type
- **💭 Vibe Check**: What your taste says about you
- **📁 Files Analyzed**: List of JSON files used
- **⏰ Timestamp**: When the analysis was performed

## Common Issues

### "No music data found"
- You need to save JSON files first using the 💾 buttons
- Check `apps/api/data/` directory exists and has JSON files

### "Anthropic API key not configured"
- Make sure `ANTHROPIC_API_KEY` is set in `apps/api/.env`
- Restart the API server after adding the key

### "Not authenticated"
- Login with Spotify first
- Make sure you're logged into the correct session

### 404 Errors
- Ensure API server is running on port 3001
- Ensure test server is running on port 3000
- Check that Spotify redirect URI is correct

## API Endpoints Summary

### Spotify Data
- `GET /stats/top-artists` - Get top artists
- `GET /stats/top-tracks` - Get top tracks
- `GET /stats/recently-played` - Get recently played
- `GET /stats/user-profile` - Get user profile

### Save Data
- `POST /stats/save-top-artists` - Save top artists to JSON
- `POST /stats/save-top-tracks` - Save top tracks to JSON
- `POST /stats/save-recently-played` - Save recently played to JSON

### AI Analysis
- `POST /ai/guess-music-age` - Analyze music data with Claude

### Authentication
- `GET /auth/login` - Initiate Spotify OAuth
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/status` - Check auth status

## Files Created

- `apps/api/src/modules/ai-analysis/aiAnalysisService.js` - AI service
- `apps/api/src/routes/aiRoutes.js` - AI routes
- `apps/api/data/*.json` - Saved music data (auto-created)
- `test-api/public/test.html` - Updated test page

## Architecture

```
User → Test Page (3000) → API Server (3001) → Spotify API
                                ↓
                         Anthropic Claude API
                                ↓
                         Analysis Results
```
