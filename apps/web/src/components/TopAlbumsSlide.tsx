import { motion } from 'motion/react';

interface Album {
  title: string;
  artist: string;
  plays: number;
}

interface TopAlbumsSlideProps {
  albums: Album[];
  bgColor: string;
}

export function TopAlbumsSlide({ albums, bgColor }: TopAlbumsSlideProps) {
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
          YOUR TOP 5 GENERATED ALBUMS
        </motion.h2>

        <div className="w-full space-y-6">
          {albums.map((album, index) => (
            <motion.div
              key={album.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.12, duration: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="text-5xl w-16 text-black font-black shrink-0">
                {index + 1}
              </div>
              <motion.div
                className="w-16 h-16 bg-white rounded shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-lg mb-1 truncate text-black font-black">{album.title}</p>
                <p className="text-sm text-black font-black truncate">{album.artist}</p>
                <p className="text-xs text-black font-black">{album.plays.toLocaleString()} plays</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
