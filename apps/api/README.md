# API / BFF

Backend-for-frontend that wraps ElevenLabs music generation and listening stats sources.

- `src/routes` – HTTP/tRPC handlers
- `src/modules` – business logic per domain (auth, generation, wrap-stats)
- `src/lib` – SDK wrappers, storage, logging
- `src/jobs` – background workers for generation/render queues
- `src/config` – env parsing and config
