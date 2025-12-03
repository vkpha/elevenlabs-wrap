import { motion } from 'motion/react';

interface Song {
  title: string;
  plays: number;
}

interface TopSongsSlideProps {
  songs: Song[];
}

export function TopSongsSlide({ songs }: TopSongsSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl mb-12"
      >
        Your top 5 generated songs
      </motion.h2>

      <div className="w-full max-w-lg space-y-5">
        {songs.map((song, index) => (
          <motion.div
            key={song.title}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.12, duration: 0.5 }}
            className="flex items-start gap-4 border-l-4 border-white pl-6 py-2"
          >
            <div className="text-4xl w-12 text-gray-500 shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-xl mb-1">{song.title}</p>
              <p className="text-sm text-gray-400">{song.plays.toLocaleString()} plays</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
