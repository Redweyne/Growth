import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const CinematicIntro = ({ onComplete, userName }) => {
  const [phase, setPhase] = useState(0);
  const firstName = userName?.split(' ')[0] || 'Champion';

  useEffect(() => {
    // Phase 0: Void (500ms)
    // Phase 1: Name reveal (1.5s)
    // Phase 2: Purpose statement (1s)
    // Total: 3 seconds max
    
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => onComplete(), 3000)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
      {/* Elegant background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Subtle ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4a574]/10 rounded-full blur-[150px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {phase === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8885f] flex items-center justify-center shadow-[0_0_60px_rgba(212,165,116,0.5)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
              {firstName}
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-2xl md:text-3xl text-[#d4a574] font-light">
              Your transformation begins
            </p>
          </motion.div>
        )}
      </div>

      {/* White fade to dashboard */}
      {phase === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="absolute inset-0 bg-white"
        />
      )}
    </div>
  );
};

export default CinematicIntro;