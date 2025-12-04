import React from 'react';

const API_BASE = 'http://127.0.0.1:3001';

export function LoginPage() {
  const handleSpotifyLogin = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };


  return (
    <div className="login-page">
      <div className="login-image" aria-hidden="true" />
      <div className="login-form">
        <h1>Eleven Labs Wrap 2025</h1>
        <button
          type="button"
          className="primary spotify-btn"
          onClick={handleSpotifyLogin}
        >
          Authenticate with Spotify
        </button>
      </div>
    </div>
  );
}
