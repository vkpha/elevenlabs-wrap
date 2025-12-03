# Spotify Recently Played Tracks

A simple web app to view your last 50 recently played songs from Spotify with an easy one-click login.

## Features

- Simple web interface with beautiful UI
- One-click Spotify authentication
- Displays your last 50 recently played tracks
- Shows track name, artist, album, duration, and play time
- Automatic token refresh handling

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description (e.g., "My Recently Played Tracker")
5. In the app settings, click "Edit Settings"
6. Add `http://127.0.0.1:3000/callback` to the **Redirect URIs** field
7. Save your settings
8. Copy your **Client ID** and **Client Secret**

**Note:** Spotify requires using the explicit IPv4 loopback address (`127.0.0.1`) instead of `localhost` for security reasons.

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   REDIRECT_URI=http://127.0.0.1:3000/callback
   ```

### 4. Start the Server

```bash
npm start
```

The server will start at `http://127.0.0.1:3000`

### 5. Use the App

1. Open your browser and go to `http://127.0.0.1:3000`
2. Click "Login with Spotify"
3. Authorize the app when prompted by Spotify
4. Click "Load My Recent Tracks" to view your listening history

That's it! The app handles all the OAuth authentication automatically.

## What You'll See

The app displays your last 50 recently played tracks with:
- Track name
- Artist(s)
- Album name
- Duration
- Timestamp of when you played it

## Tech Stack

- Node.js + Express
- Vanilla JavaScript (no frameworks)
- Spotify Web API
- OAuth 2.0 authentication

## API Reference

This app uses the [Spotify Web API - Get Recently Played Tracks](https://developer.spotify.com/documentation/web-api/reference/get-recently-played) endpoint.
