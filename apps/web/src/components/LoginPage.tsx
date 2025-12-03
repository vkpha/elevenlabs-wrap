import React from 'react';
import loginImage from '../../../../assets/login_image.jpg';

export function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-image" aria-hidden="true" />
      <div className="login-form">
        <h1>Eleven Labs Wrap 2025</h1>
        <button type="button" className="primary spotify-btn">
          Authenticate with Spotify
        </button>
      </div>
    </div>
  );
}
