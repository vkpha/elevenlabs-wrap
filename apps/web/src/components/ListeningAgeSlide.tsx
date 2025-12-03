import { motion } from 'motion/react';

interface ListeningAgeSlideProps {
  age: number;
}

export function ListeningAgeSlide({ age }: ListeningAgeSlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-4xl mb-4">
          Age is just a number
        </h2>
        <p className="text-xl text-gray-400 mb-12">(so don't take it personally)</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="relative"
      >
        <div className="w-64 h-64 rounded-full border-8 bg-white border-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-2">{age}</div>
            <p className="text-xl text-gray-300">years old</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-12 text-lg text-gray-400"
      >
        Your listening age
      </motion.p>
    </div>
  );
}
