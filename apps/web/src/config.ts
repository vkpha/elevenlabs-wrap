// API configuration
// In production (Railway), the API is served from the same origin, so we use empty string
// In development, we use the local API server
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';
