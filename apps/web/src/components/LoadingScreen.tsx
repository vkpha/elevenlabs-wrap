import React, { useState, useEffect, useRef } from 'react';
import elevatorMusic from '../../../../assets/elevator_music.mp3';
import { API_BASE } from '../config';

interface LoadingScreenProps {
  onComplete: (analysisData: any, trackUrls: string[]) => void;
  forceRegenerate?: boolean;
}

export function LoadingScreen({ onComplete, forceRegenerate = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState('Initializing...');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [asciiFrame, setAsciiFrame] = useState(0);

  useEffect(() => {
    // Start playing elevator music
    if (!audioRef.current) {
      audioRef.current = new Audio(elevatorMusic);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    audioRef.current.play().catch((err: any) => console.error('Failed to play elevator music:', err));

    // Start the data flow
    startDataFlow();

    // Cleanup: stop music when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Animate ASCII art
  useEffect(() => {
    const interval = setInterval(() => {
      setAsciiFrame((prev: number) => (prev + 1) % 8);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const getAsciiArt = () => {
    const cols = 80;
    const rows = 30;
    const text = 'ELEVEN LABS';

    let output = '';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate if this position should show "ELEVEN LABS"
        const seed = Math.sin(row * 0.5 + col * 0.3 + asciiFrame * 0.1) * 100;
        const textAppears = Math.floor(Math.abs(seed)) % 15 === 0;

        if (textAppears && col < cols - text.length) {
          output += text;
          col += text.length - 1; // Skip ahead
        } else {
          // Fill with random characters that shift
          const charIndex = (row + col + asciiFrame) % 10;
          output += charIndex.toString();
        }
      }
      output += '\n';
    }

    return output;
  };

  const startDataFlow = async () => {
    try {
      // Step 0: Handle force regenerate
      if (forceRegenerate) {
        setProgress('Clearing old data...');
        await fetch(`${API_BASE}/wrapped/cache`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } else {
        // Check if user has cached data
        setProgress('Checking for existing wrapped data...');
        const cacheCheckResponse = await fetch(`${API_BASE}/wrapped/check`, { credentials: 'include' });
        const cacheCheck = await cacheCheckResponse.json();

        if (cacheCheck.hasCachedData) {
          // User already has generated wrapped, load it directly
          setProgress('Loading your existing wrapped...');
          const cachedResponse = await fetch(`${API_BASE}/wrapped/cached`, { credentials: 'include' });
          const cachedData = await cachedResponse.json();

          if (cachedData.success && cachedData.data) {
            // Fetch track URLs
            const tracksResponse = await fetch(`${API_BASE}/music/tracks`, { credentials: 'include' });
            const tracksData = await tracksResponse.json();
            const trackUrls = tracksData.tracks.map((t: any) => `${API_BASE}${t.url}`);

            setProgress('Complete! Loading your wrapped...');

            // Fade out elevator music
            const fadeOutInterval = setInterval(() => {
              if (audioRef.current && audioRef.current.volume > 0.05) {
                audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
              } else {
                clearInterval(fadeOutInterval);
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              }
            }, 50);

            setTimeout(() => onComplete(cachedData.data.analysis, trackUrls), 500);
            return;
          }
        }
      }

      // No cached data, proceed with full generation flow
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

              // All done, fade out music and notify parent
              setProgress('Complete! Starting your wrapped...');

              // Fade out elevator music
              const fadeOutInterval = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                  audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
                } else {
                  clearInterval(fadeOutInterval);
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                }
              }, 50);

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full h-screen flex flex-col items-center justify-center">
        {/* Animated ASCII Art - Full screen of text */}
        <div className="mb-8 overflow-hidden">
          <pre
            className="font-mono text-[6px] sm:text-[8px] leading-none"
            style={{
              color: '#ffffff',
              whiteSpace: 'pre',
              letterSpacing: '0.1em',
              opacity: 0.9
            }}
          >
            {getAsciiArt()}
          </pre>
        </div>

        {/* Progress text */}
        <p className="text-xl mt-8" style={{ opacity: 0.9 }}>
          {progress}
        </p>

        {/* Loading dots animation */}
        <div className="mt-4 text-2xl tracking-widest">
          <span className="dot-1">.</span>
          <span className="dot-2">.</span>
          <span className="dot-3">.</span>
        </div>
      </div>

      <style>{`
        @keyframes blink1 {
          0%, 100% { opacity: 0; }
          33% { opacity: 1; }
        }
        @keyframes blink2 {
          0%, 100% { opacity: 0; }
          66% { opacity: 1; }
        }
        @keyframes blink3 {
          0%, 33% { opacity: 0; }
          100% { opacity: 1; }
        }
        .dot-1 {
          animation: blink1 1.4s infinite;
        }
        .dot-2 {
          animation: blink2 1.4s infinite;
        }
        .dot-3 {
          animation: blink3 1.4s infinite;
        }
      `}</style>
    </div>
  );
}
