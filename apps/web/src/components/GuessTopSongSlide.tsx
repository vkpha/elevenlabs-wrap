import { motion } from 'motion/react';
import { useState } from 'react';

interface GuessTopSongSlideProps {
  songTitle: string;
  bgColor: string;
}

export function GuessTopSongSlide({ songTitle, bgColor }: GuessTopSongSlideProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-12 max-w-2xl shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-4xl mb-16 text-black font-black">
            Guess your top <br />
            AI generated song?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center"
        >
          {!revealed ? (
            <motion.button
              onClick={() => setRevealed(true)}
              className="w-72 h-72 rounded-full bg-white text-black flex items-center justify-center text-2xl cursor-pointer font-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tap to reveal
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-72 h-72 rounded-full border-4 border-black bg-white flex items-center justify-center p-8"
            >
              <p className="text-3xl italic text-black font-black">{songTitle}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
