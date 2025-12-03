import { motion } from 'motion/react';

interface IntroSlideProps {
  genreCount: number;
}

export function IntroSlide({ genreCount }: IntroSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-5xl mb-8 italic">
          Taste like yours <br />
          can't be defined.
        </h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className="text-2xl mb-4">But let's try anyway:</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-8"
      >
        <div className="text-8xl mb-4">{genreCount}</div>
        <p className="text-xl text-gray-400">genres</p>
      </motion.div>
    </div>
  );
}
