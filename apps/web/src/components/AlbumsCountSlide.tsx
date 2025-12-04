import { motion } from 'motion/react';

interface AlbumsCountSlideProps {
  count: number;
  bgColor: string;
}

export function AlbumsCountSlide({ count, bgColor }: AlbumsCountSlideProps) {
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
          <h2 className="text-3xl mb-8 text-black font-black">
            You listened to
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, type: 'spring', bounce: 0.5 }}
          className="mb-8"
        >
          <div className="text-9xl text-black font-black">{count}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className="text-3xl text-black font-black">albums this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-12"
        >
          <div className="flex gap-2 justify-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                className="w-16 h-16 bg-white rounded"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
