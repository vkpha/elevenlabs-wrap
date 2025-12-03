import { motion } from 'motion/react';

export function BackgroundAsset() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Concentric circles pattern */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-[40px] border-white/10"
            style={{
              transform: `scale(${1 - i * 0.12})`,
            }}
          />
        ))}
      </motion.div>

      {/* Diagonal stripes */}
      <div className="absolute -left-1/4 top-0 w-1/3 h-full opacity-90">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="stripes" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="30" height="60" fill="black" />
              <rect x="30" width="30" height="60" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stripes)" />
        </svg>
      </div>

      {/* Organic blob shapes in grayscale */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, white 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, white 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -70, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Organic flowing lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M 0,300 Q 200,100 400,300 T 800,300"
          stroke="white"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        <motion.path
          d="M 800,500 Q 600,700 400,500 T 0,500"
          stroke="white"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
        />
      </svg>

      {/* Bold graphic shapes */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-64"
        style={{
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))',
          backgroundSize: '60px 60px',
        }}
        animate={{ x: [0, 60] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Wavy organic shapes */}
      <svg className="absolute top-0 right-0 w-1/3 h-full opacity-15" viewBox="0 0 200 800">
        <motion.path
          d="M 0,0 Q 100,100 100,200 T 100,400 T 100,600 T 100,800 L 200,800 L 200,0 Z"
          fill="white"
          animate={{
            d: [
              "M 0,0 Q 100,100 100,200 T 100,400 T 100,600 T 100,800 L 200,800 L 200,0 Z",
              "M 0,0 Q 150,80 100,200 T 100,400 T 80,600 T 100,800 L 200,800 L 200,0 Z",
              "M 0,0 Q 100,100 100,200 T 100,400 T 100,600 T 100,800 L 200,800 L 200,0 Z",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* Floating geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
            opacity: 0.08,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Abstract curved lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M 100,0 Q 200,200 150,400 Q 100,600 200,800"
          stroke="white"
          strokeWidth="80"
          fill="none"
          animate={{
            d: [
              "M 100,0 Q 200,200 150,400 Q 100,600 200,800",
              "M 150,0 Q 100,200 200,400 Q 150,600 100,800",
              "M 100,0 Q 200,200 150,400 Q 100,600 200,800",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Corner accent patterns */}
      <div 
        className="absolute top-0 left-0 w-32 h-32 rounded-br-full bg-white"
        style={{ opacity: 0.1 }}
      />
      <div 
        className="absolute bottom-0 right-0 w-40 h-40 rounded-tl-full bg-white"
        style={{ opacity: 0.1 }}
      />
    </div>
  );
}