# ElevenLabs Music Generation

## ✅ Current Implementation

**Using ElevenLabs Music API which supports up to 300 seconds (5 minutes) per generation.**

The Music API (`/v1/music/detailed`) is designed for music generation and supports:
- Duration: 3 seconds to 300 seconds (5 minutes)
- Parameter: `music_length_ms` (in milliseconds)
- Model: `music_v1`

## Previous Issue (RESOLVED)

~~**ElevenLabs Sound Effects API had a maximum duration of 30 seconds per generation.**~~

We were previously using the Sound Effects API which had a 30-second limit. We've now switched to the proper Music API which supports up to 5 minutes.

## Current Implementation

The service now generates **120-second (2-minute) tracks** directly using the Music API:

```javascript
const response = await this.client.music.composeDetailed({
  prompt: prompt,
  music_length_ms: 120000, // 120 seconds = 2 minutes
  model_id: 'music_v1',
});
```

### Key Features:
- **Direct generation**: Single API call per track (no concatenation needed)
- **Duration range**: 3-300 seconds (3s to 5 minutes)
- **Model**: `music_v1` - trained on licensed data
- **Output**: MP3 format with studio-grade quality
- **Commercial use**: Cleared for broad commercial use

### File output:
- Format: `track-N-timestamp.mp3`
- Duration: 120 seconds (2 minutes)
- Quality: Studio-grade MP3

## Alternative Approaches (Not Needed)

Since we're now using the Music API, these workarounds are no longer necessary:

### ~~Option 1: Multiple Segments + Concatenation~~
~~Previously needed when using Sound Effects API with 30s limit~~

### ~~Option 2: Different APIs~~
~~Alternatives like Suno AI, Udio, MusicGen - not needed now~~

## API Documentation

For more details, see:
- [ElevenLabs Music API Documentation](https://elevenlabs.io/docs/api-reference/music/compose-detailed)
- [Music Quickstart Guide](https://elevenlabs.io/docs/cookbooks/music/quickstart)
