import { motion } from 'motion/react';

interface ListeningAgeSlideProps {
  age: number;
  bgColor: string;
}

export function ListeningAgeSlide({ age, bgColor }: ListeningAgeSlideProps) {
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
          <h2 className="text-4xl mb-4 text-black font-black">
            Age is just a number
          </h2>
          <p className="text-xl text-black font-black mb-12">(so don't take it personally)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="flex items-center justify-center"
        >
          <div className="w-64 h-64 rounded-full border-8 bg-white border-white flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl mb-2 text-black font-black">{age}</div>
              <p className="text-xl text-black font-black">years old</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 text-lg text-black font-black"
        >
          Your listening age
        </motion.p>
      </motion.div>
    </div>
  );
}
