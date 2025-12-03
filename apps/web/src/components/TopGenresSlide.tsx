import { motion } from 'motion/react';

interface TopGenresSlideProps {
  genres: string[];
}

export function TopGenresSlide({ genres }: TopGenresSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl mb-12"
      >
        Your top 5 genres
      </motion.h2>

      <div className="w-full max-w-lg space-y-6">
        {genres.map((genre, index) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
            className="flex items-center gap-6"
          >
            <div className="text-6xl w-16 text-gray-500">
              {index + 1}
            </div>
            <div className="flex-1 border-b-2 border-orange pb-4">
              <p className="text-xl">{genre}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
