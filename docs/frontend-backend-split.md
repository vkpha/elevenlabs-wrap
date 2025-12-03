# Frontend vs Backend Split

## Frontend (`apps/web`)
- Next.js app (app router) rendering Wrapped experience and marketing.
- Handles auth UI, session state, and route protection.
- Collects prompts/presets for ElevenLabs generation and shows progress.
- Displays listening stats story slides; triggers share/export actions.
- Talks only to the BFF via typed SDK/client (`packages/sdk`).

Key front slices:
- `src/features/wrap` – story/stepper, stats carousel, slide rendering.
- `src/features/generation` – prompt forms, queue submission, status polling/WS subscription.
- `src/features/library` – saved/generated tracks and playlists.
- `src/features/auth` – login/logout/guards.
- `src/shared/providers` – app-level context (auth, query client, theme).

## Backend (`apps/api`)
- BFF that normalizes listening stats and wraps ElevenLabs music generation.
- Owns auth, rate limits, and input validation.
- Exposes routes (REST/tRPC) for generation requests, status lookups, track retrieval, share links, and stats ingestion.
- Manages background jobs for generation/rendering and object storage writes.

Key back modules:
- `src/modules/generation` – enqueue jobs, call ElevenLabs, persist metadata.
- `src/modules/wrap-stats` – ingest/compute top artists/tracks/time-of-day patterns.
- `src/modules/auth` – session issuance/verification; OAuth if needed.
- `src/routes` – HTTP/tRPC layer (validation, serialization).
- `src/jobs` – workers for generation and slide prerender tasks.

## Shared (`packages/*`)
- `sdk` – typed client for BFF/ElevenLabs; used by web and workers.
- `types` – domain and API contracts.
- `ui` – design system components.
- `analytics` – event schema/client shared across apps.
- `config` – lint/build configs reused across packages.

## Data/flow sketch
1) Web collects prompt/preset → calls BFF `/generation` (or mutation).
2) BFF enqueues job; returns generation id.
3) Worker calls ElevenLabs, stores audio (e.g., S3), updates status.
4) Web polls/subscribes to status → renders player/story slide when ready.
5) Stats ingestion either from external providers (Spotify/Apple) or synthetic seed → BFF computes aggregates → web consumes for slides.
6) Sharing/export endpoints return pre-rendered assets or playlist export links.
