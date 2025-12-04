import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntroSlide } from './components/IntroSlide';
import { TopGenresSlide } from './components/TopGenresSlide';
import { ListeningAgeSlide } from './components/ListeningAgeSlide';
import { GuessTopSongSlide } from './components/GuessTopSongSlide';
import { TopSongsSlide } from './components/TopSongsSlide';
import { AlbumsCountSlide } from './components/AlbumsCountSlide';
import { TopAlbumSlide } from './components/TopAlbumSlide';
import { InsightsSlide } from './components/InsightsSlide';
import { BackgroundAsset } from './components/BackgroundAsset';
import bg1 from '../../../assets/eleven_labs_background_1.mp4';
import bg2 from '../../../assets/eleven_labs_background_2.mp4';
import bg3 from '../../../assets/eleven_labs_background_3.mp4';
import bg4 from '../../../assets/eleven_labs_background_4.mp4';
import bg5 from '../../../assets/eleven_labs_background_5.mp4';
import bg6 from '../../../assets/eleven_labs_background_6.mp4';
import bg7 from '../../../assets/eleven_labs_background_7.mp4';
import bg8 from '../../../assets/eleven_labs_background_8.mp4';
import { LoginPage } from './components/LoginPage';
import { LoadingScreen } from './components/LoadingScreen';

// Helper function to parse wrapped data into slide format
const parseWrappedData = (analysis: any) => {
  if (!analysis) {
    // Fallback to mock data if no analysis available
    return {
      genreCount: 127,
      topGenres: ['Audiobook Narration', 'Podcast Voiceover', 'Character Voice Acting', 'Documentary Narration', 'ASMR'],
      listeningAge: 34,
      topSong: 'Midnight Stories',
      topSongs: [
        { title: 'Midnight Stories', plays: 2847 },
        { title: 'The Last Chapter', plays: 2156 },
        { title: 'Whispers in the Dark', plays: 1923 },
        { title: 'Digital Dreams', plays: 1765 },
        { title: 'Echoes of Tomorrow', plays: 1542 }
      ],
      albumCount: 89,
      topAlbum: 'Synthetic Emotions',
      insights: 'Your music taste is unique and diverse!',
      musicGeneration: 'Audio Storyteller',
      reasoning: ['You have an eclectic taste in audio content.', 'Your listening patterns suggest a creative mind.']
    };
  }

  // Map AI analysis to slide data format
  const musicPrompts = analysis.musicPrompts || [];
  const recommendedAlbums = analysis.recommendedAlbums || [];

  return {
    genreCount: analysis.genreCount || 0,
    topGenres: analysis.topGenres || [],
    listeningAge: analysis.estimatedAge || 25,
    topSong: musicPrompts[0]?.title || 'Unknown Track',
    topSongs: musicPrompts.slice(0, 5).map((track: any, index: number) => ({
      title: track.title,
      plays: 3000 - (index * 200) // Generate decreasing play counts
    })),
    albumCount: recommendedAlbums.length + 1, // +1 for personal album
    topAlbum: analysis.personalAlbumTitle || 'Your Personal Album',
    insights: analysis.insights || 'Your music taste is unique and diverse!',
    musicGeneration: analysis.musicGeneration || 'Music Explorer',
    reasoning: analysis.reasoning || ['You have an eclectic taste in music.']
  };
};

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // App state based on hash
  const [appState, setAppState] = useState<'login' | 'loading' | 'slides'>('login');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [trackUrls, setTrackUrls] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [waveformBars, setWaveformBars] = useState<number[]>([3, 7, 4, 8, 5, 9, 6, 10, 5, 8, 4, 7, 6, 9, 5, 8]);

  const videoSources = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8];
  const textPalette = ['#39ff14', '#ff914d', '#7dd3ff', '#a855f7', '#ff5fa0', '#ff6b6b', '#1f4b99', '#0f7b3f'];

  // Parse wrapped data for slides
  const slideData = parseWrappedData(analysisData);

  const slides = [
    <IntroSlide genreCount={slideData.genreCount} bgColor={textPalette[0]} />,
    <TopGenresSlide genres={slideData.topGenres} bgColor={textPalette[1]} />,
    <ListeningAgeSlide age={slideData.listeningAge} bgColor={textPalette[2]} />,
    <GuessTopSongSlide songTitle={slideData.topSong} bgColor={textPalette[3]} />,
    <TopSongsSlide songs={slideData.topSongs} bgColor={textPalette[4]} />,
    <AlbumsCountSlide count={slideData.albumCount} bgColor={textPalette[5]} />,
    <TopAlbumSlide album={slideData.topAlbum} bgColor={textPalette[6]} />,
    <InsightsSlide
      insights={slideData.insights}
      musicGeneration={slideData.musicGeneration}
      reasoning={slideData.reasoning}
      bgColor={textPalette[7]}
    />
  ];

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err: any) => console.error('Audio playback failed:', err));
      setIsPlaying(true);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Handler for when loading completes
  const handleLoadingComplete = (analysis: any, urls: string[]) => {
    // Persist to localStorage
    localStorage.setItem('elevenlabs_analysis', JSON.stringify(analysis));
    localStorage.setItem('elevenlabs_tracks', JSON.stringify(urls));

    setAnalysisData(analysis);
    setTrackUrls(urls);
    window.location.hash = '#slides';
    setAppState('slides');
  };

  // Play audio for current slide
  useEffect(() => {
    if (appState !== 'slides' || trackUrls.length === 0) return;

    // Use currentSlide directly as trackIndex (no modulo) to ensure 1:1 mapping
    const trackIndex = currentSlide;
    const trackUrl = trackUrls[trackIndex];

    if (!trackUrl) return;

    // Update current track title
    const musicPrompts = analysisData?.musicPrompts || [];
    const trackInfo = musicPrompts[trackIndex];
    setCurrentTrackTitle(trackInfo?.title || `Track ${trackIndex + 1}`);

    // Create or update audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    // Fade out previous, load new, fade in
    const audio = audioRef.current;

    const fadeOut = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05);
      } else {
        clearInterval(fadeOut);
        audio.pause();
        audio.src = trackUrl;
        audio.load();
        audio.volume = 0;

        audio.play().then(() => {
          setIsPlaying(true);
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.45) {
              audio.volume = Math.min(0.5, audio.volume + 0.05);
            } else {
              clearInterval(fadeIn);
            }
          }, 50);
        }).catch((err: any) => console.error('Audio playback failed:', err));
      }
    }, 50);

    return () => {
      clearInterval(fadeOut);
    };
  }, [currentSlide, appState, trackUrls]);

  // Animate waveform bars
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 8) + 3));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Check authentication and restore state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if returning from Spotify auth
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        const urlParams = new URLSearchParams(queryString);

        if (urlParams.get('success') === 'true') {
          // Redirect to loading screen
          window.location.hash = '#loading';
          setAppState('loading');
          setIsCheckingAuth(false);
          return;
        }

        // Try to verify if user is authenticated by checking backend
        const response = await fetch('http://127.0.0.1:3001/auth/status', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();

          if (data.authenticated) {
            // User is authenticated, try to restore from localStorage
            const storedAnalysis = localStorage.getItem('elevenlabs_analysis');
            const storedTracks = localStorage.getItem('elevenlabs_tracks');

            if (storedAnalysis && storedTracks) {
              // Restore from localStorage
              const analysis = JSON.parse(storedAnalysis);
              const tracks = JSON.parse(storedTracks);
              setAnalysisData(analysis);
              setTrackUrls(tracks);

              // Navigate to slides or respect current hash
              if (hash === '#slides' || !hash || hash === '#') {
                window.location.hash = '#slides';
                setAppState('slides');
              } else if (hash === '#loading') {
                setAppState('loading');
              }
            } else {
              // User is authenticated but no cached data, go to loading
              window.location.hash = '#loading';
              setAppState('loading');
            }
          } else {
            // Not authenticated, show login
            setAppState('login');
            window.location.hash = '';
          }
        } else {
          // Error checking auth, default to login
          setAppState('login');
          window.location.hash = '';
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, default to login
        setAppState('login');
        window.location.hash = '';
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#loading') setAppState('loading');
      else if (hash === '#slides') setAppState('slides');
      else setAppState('login');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (appState !== 'slides') return;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (isNavigating) return;
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      setIsNavigating(true);
      if (e.deltaY > 0) nextSlide();
      else prevSlide();
      setTimeout(() => setIsNavigating(false), 650);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isNavigating || touchStartY.current === null) return;
      const delta = touchStartY.current - (e.changedTouches[0]?.clientY ?? touchStartY.current);
      if (Math.abs(delta) < 24) return;
      setIsNavigating(true);
      if (delta > 0) nextSlide();
      else prevSlide();
      setTimeout(() => setIsNavigating(false), 650);
      touchStartY.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavigating) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsNavigating(true);
        nextSlide();
        setTimeout(() => setIsNavigating(false), 650);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsNavigating(true);
        prevSlide();
        setTimeout(() => setIsNavigating(false), 650);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNavigating, currentSlide, appState]);

  // Show nothing while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Render login page
  if (appState === 'login') {
    return <LoginPage />;
  }

  // Render loading screen
  if (appState === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      <div className="fixed inset-0 w-screen h-screen -z-10 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.video
            key={currentSlide}
            custom={direction}
            src={videoSources[currentSlide % videoSources.length]}
            className="object-cover opacity-80 absolute"
            style={{
              width: '150vw',
              height: '150vh',
              minWidth: '150vw',
              minHeight: '150vh',
              top: '50%',
              left: '50%'
            }}
            autoPlay
            muted
            playsInline
            initial={{ x: direction > 0 ? 'calc(-50% + 100%)' : 'calc(-50% - 100%)', y: '-50%' }}
            animate={{ x: '-50%', y: '-50%' }}
            exit={{ x: direction > 0 ? 'calc(-50% - 100%)' : 'calc(-50% + 100%)', y: '-50%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="relative w-full" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 1, x: -30 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center p-8 slide-block"
            >
              {slides[currentSlide]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Music Player Widget - Bottom of Card */}
        {currentTrackTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white text-black px-6 py-5 rounded-full shadow-lg flex items-center gap-4"
            style={{ minWidth: '400px', maxWidth: '90%', marginTop: '24px', minHeight: '72px' }}
          >
            {/* Previous button */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Previous track"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 2v12M13 2L6 8l7 6V2z" fill="currentColor" />
              </svg>
            </button>

            {/* Play/Pause button */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors flex-shrink-0 mr-2"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor" />
                  <rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* Waveform visualization */}
            <div className="flex items-center gap-2 flex-shrink-0 h-10">
              {waveformBars.slice(0, 8).map((height, i) => (
                <div
                  key={i}
                  className="bg-black rounded-sm transition-all duration-150"
                  style={{
                    width: '5px',
                    height: `${isPlaying ? height * 3.5 : 8}px`,
                  }}
                />
              ))}
            </div>

            {/* Track title only */}
            <div className="flex-1 min-w-0 px-2 text-center">
              <div className="text-base font-semibold truncate">{currentTrackTitle}</div>
            </div>

            {/* Next button */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Next track"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M13 2v12M3 2l7 6-7 6V2z" fill="currentColor" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
