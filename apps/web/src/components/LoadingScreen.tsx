import React, { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:3001';

interface LoadingScreenProps {
  onComplete: (analysisData: any, trackUrls: string[]) => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState('Initializing...');

  useEffect(() => {
    startDataFlow();
  }, []);

  const startDataFlow = async () => {
    try {
      // Step 1: Fetch Spotify data
      setProgress('Fetching your Spotify data...');
      await Promise.all([
        fetch(`${API_BASE}/stats/top-artists?time_range=medium_term&limit=50`, { credentials: 'include' })
          .then(r => r.json())
          .then(data => fetch(`${API_BASE}/stats/save-top-artists?time_range=medium_term&limit=50`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data })
          })),
        fetch(`${API_BASE}/stats/top-tracks?time_range=medium_term&limit=50`, { credentials: 'include' })
          .then(r => r.json())
          .then(data => fetch(`${API_BASE}/stats/save-top-tracks?time_range=medium_term&limit=50`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data })
          })),
        fetch(`${API_BASE}/stats/recently-played?limit=50`, { credentials: 'include' })
          .then(r => r.json())
          .then(data => fetch(`${API_BASE}/stats/save-recently-played?limit=50`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data })
          }))
      ]);

      // Step 2: AI Analysis
      setProgress('Analyzing your music taste with AI...');
      const aiResponse = await fetch(`${API_BASE}/ai/guess-music-age`, {
        method: 'POST',
        credentials: 'include'
      });
      const aiData = await aiResponse.json();

      // Step 3: Generate music previews
      setProgress('Generating 8 preview tracks with ElevenLabs...');
      const response = await fetch(`${API_BASE}/music/generate-from-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ analysis: aiData.analysis, duration: 20 })
      });

      // Handle SSE stream for progress
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'complete') {
              // Fetch track URLs
              const tracksResponse = await fetch(`${API_BASE}/music/tracks`, { credentials: 'include' });
              const tracksData = await tracksResponse.json();
              const trackUrls = tracksData.tracks.map((t: any) => `${API_BASE}${t.url}`);

              // All done, notify parent
              setProgress('Complete! Starting your wrapped...');
              setTimeout(() => onComplete(aiData.analysis, trackUrls), 1000);
            } else if (data.current) {
              setProgress(`Generating track ${data.current}/${data.total}...`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during data flow:', error);
      setProgress('Error occurred. Please refresh and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="text-center max-w-lg px-8">
        <h1 className="text-5xl mb-8" style={{ fontWeight: 700 }}>
          Generating ElevenLabs Wrapped
        </h1>

        {/* Animated spinner */}
        <div className="mb-8 flex justify-center">
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(255,255,255,0.2)',
              borderTop: '6px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>

        {/* Progress text */}
        <p className="text-xl" style={{ opacity: 0.9 }}>
          {progress}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
