import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntroSlide } from './components/IntroSlide';
import { TopGenresSlide } from './components/TopGenresSlide';
import { ListeningAgeSlide } from './components/ListeningAgeSlide';
import { GuessTopSongSlide } from './components/GuessTopSongSlide';
import { TopSongsSlide } from './components/TopSongsSlide';
import { AlbumsCountSlide } from './components/AlbumsCountSlide';
import { TopAlbumSlide } from './components/TopAlbumSlide';
import { TopAlbumsSlide } from './components/TopAlbumsSlide';
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
      topAlbums: [
        { title: 'Synthetic Emotions', artist: 'AI Narrator', plays: 5234 },
        { title: 'Voice Chronicles', artist: 'Digital Storyteller', plays: 4892 },
        { title: 'Spoken Word Dreams', artist: 'Neural Voice', plays: 4156 },
        { title: 'Audio Landscapes', artist: 'Generated Voices', plays: 3847 },
        { title: 'The Infinite Library', artist: 'AI Ensemble', plays: 3621 }
      ]
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
    topAlbums: [
      {
        title: analysis.personalAlbumTitle || 'Your Personal Album',
        artist: analysis.personalAlbumArtist || 'Your AI',
        plays: 5000
      },
      ...recommendedAlbums.slice(0, 4).map((album: any, index: number) => ({
        title: album.title,
        artist: 'Your AI',
        plays: 4500 - (index * 300)
      }))
    ]
  };
};

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // App state based on hash
  const [appState, setAppState] = useState<'login' | 'loading' | 'slides'>(() => {
    const hash = window.location.hash;
    if (hash === '#loading') return 'loading';
    if (hash === '#slides') return 'slides';
    return 'login';
  });
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [trackUrls, setTrackUrls] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <TopAlbumsSlide albums={slideData.topAlbums} bgColor={textPalette[7]} />
  ];

  const goToSlide = (index: number) => {
    if (index < 0 || index > slides.length - 1) return;
    setCurrentSlide(index);
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
    setAnalysisData(analysis);
    setTrackUrls(urls);
    window.location.hash = '#slides';
    setAppState('slides');
  };

  // Play audio for current slide
  useEffect(() => {
    if (appState !== 'slides' || trackUrls.length === 0) return;

    const trackIndex = currentSlide % trackUrls.length;
    const trackUrl = trackUrls[trackIndex];

    if (!trackUrl) return;

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
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.45) {
              audio.volume = Math.min(0.5, audio.volume + 0.05);
            } else {
              clearInterval(fadeIn);
            }
          }, 50);
        }).catch(err => console.error('Audio playback failed:', err));
      }
    }, 50);

    return () => {
      clearInterval(fadeOut);
    };
  }, [currentSlide, appState, trackUrls]);

  useEffect(() => {
    // Check if returning from Spotify auth
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.get('success') === 'true') {
      // Redirect to loading screen
      window.location.hash = '#loading';
      setAppState('loading');
    }
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
      <div className="w-full max-w-2xl h-screen relative z-10">
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

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-black w-8' : 'bg-black/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
