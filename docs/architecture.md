# ElevenLabs Wrapped Architecture (Draft)

- **Frontend (apps/web)**: Next.js app that runs the Wrapped experience, handles auth, prompts/presets, displays story slides, and streams/generated audio.
- **API/BFF (apps/api)**: Normalizes listening stats, wraps ElevenLabs music generation, manages generation queues, and exposes typed endpoints.
- **Pipelines**: Generation requests enqueue jobs; workers call ElevenLabs, store assets (e.g., S3), and emit status updates for polling/websocket.
- **Sharing**: Pre-render slides to images/gifs and generate shareable links; optionally export playlists to Spotify/Apple.
- **Observability**: Centralized logging/metrics/tracing; feature flags for experiments.
