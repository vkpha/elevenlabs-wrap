import { motion } from 'motion/react';

interface TopGenresSlideProps {
  genres: string[];
  bgColor: string;
}

export function TopGenresSlide({ genres, bgColor }: TopGenresSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-12 max-w-2xl w-full shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl mb-12 text-black font-black"
        >
          YOUR TOP 5 GENRES
        </motion.h2>

        <div className="w-full space-y-6">
          {genres.map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="text-5xl w-16 text-black font-black">
                {index + 1}
              </div>
              <div className="flex-1 border-b-2 border-black pb-4">
                <p className="text-xl text-black font-black">{genre}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
