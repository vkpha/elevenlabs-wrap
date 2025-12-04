import { motion } from 'motion/react';

interface InsightsSlideProps {
  insights: string;
  musicGeneration: string;
  reasoning: string[];
  bgColor: string;
}

export function InsightsSlide({ insights, musicGeneration, reasoning, bgColor }: InsightsSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-20 max-w-6xl w-full shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex flex-col">
          <div className="w-full">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl mb-12 text-black font-black"
            >
              YOUR MUSIC IDENTITY
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-10"
            >
              <p className="text-2xl text-black font-bold mb-4 bg-white inline-block px-6 py-3 rounded-xl shadow-lg">
                You're a "{musicGeneration}"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-xl text-black leading-relaxed">
                {insights}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
