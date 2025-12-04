import { motion } from 'motion/react';

interface TopAlbumSlideProps {
  album: string;
  bgColor: string;
}

export function TopAlbumSlide({ album, bgColor }: TopAlbumSlideProps) {
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
          <h2 className="text-3xl mb-12 text-black font-black">
            THE ALBUM BEST RESEMBLING YOUR TASTE
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="flex items-center justify-center"
        >
          <div className="w-80 h-80 bg-white rounded-lg shadow-2xl flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
            <p className="text-4xl text-black relative z-10 text-center italic font-black">
              {album}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
