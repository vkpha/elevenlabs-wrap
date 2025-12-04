import React from 'react';
import { motion } from 'motion/react';
import loginBg from '../../../../assets/eleven_labs_background_login.mp4';

const API_BASE = 'http://127.0.0.1:3001';

export function LoginPage() {
  const handleSpotifyLogin = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000',
      display: 'flex'
    }}>
      {/* Background Video - Left Side */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover'
          }}
        >
          <source src={loginBg} type="video/mp4" />
        </video>
      </div>

      {/* Right Column - Minimalistic Login */}
      <div style={{
        width: '400px',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              ELEVENLABS<br />WRAPPED
            </h1>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: 400,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.6
            }}>
              Discover your unique music personality with AI-generated tracks tailored to your taste.
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSpotifyLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: '#fff',
              backgroundColor: '#1DB954',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, background-color 0.3s ease',
              boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = '#1ed760';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#1DB954';
            }}
          >
            {/* Spotify Logo SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Login with Spotify</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
