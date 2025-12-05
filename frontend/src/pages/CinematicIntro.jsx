import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const CinematicIntro = ({ onComplete, userName }) => {
  const [phase, setPhase] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // REVOLUTIONARY narrative - FAST, PUNCHY, EMOTIONAL
  const narrativePhases = [
    {
      type: 'void',
      duration: 1500,
      content: null
    },
    {
      type: 'awakening',
      duration: 2800,
      text: 'There is a version of you',
      subtext: 'waiting to be unleashed',
    },
    {
      type: 'revelation',
      duration: 2500,
      text: 'Every legend',
      highlight: 'started exactly where you are now',
    },
    {
      type: 'triple_wisdom',
      duration: 5000,
      quotes: [
        { text: 'Whatever the mind can conceive', author: 'Napoleon Hill', icon: '👑', color: '#d4a574' },
        { text: 'You fall to the level of your systems', author: 'James Clear', icon: '⚡', color: '#60a5fa' },
        { text: 'The obstacle IS the path', author: 'Marcus Aurelius', icon: '🏔️', color: '#10b981' }
      ]
    },
    {
      type: 'explosion',
      duration: 3000,
      text: 'Three forces',
      subtext: 'One destiny',
      highlight: userName ? userName.split(' ')[0].toUpperCase() : 'YOU',
    },
    {
      type: 'ascension',
      duration: 2500,
      text: 'Your transformation begins',
    }
  ];

  // Initialize Web Audio API for ambient sound
  useEffect(() => {
    if (audioEnabled && !audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.1;
      } catch (e) {
        console.log('Audio not supported');
      }
    }
    
    return () => {
      if (oscillatorRef.current) {
        if (Array.isArray(oscillatorRef.current)) {
          oscillatorRef.current.forEach(osc => osc.stop());
        } else {
          oscillatorRef.current.stop();
        }
        oscillatorRef.current = null;
      }
    };
  }, [audioEnabled]);

  // Play INSPIRING ambient music - chord progressions that move the soul
  const playAmbientSound = (phaseType = 'default') => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    try {
      // Stop any existing oscillators
      if (oscillatorRef.current) {
        if (Array.isArray(oscillatorRef.current)) {
          oscillatorRef.current.forEach(osc => osc.stop());
        } else {
          oscillatorRef.current.stop();
        }
      }
      
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const oscillators = [];
      
      // Musical scales and chord progressions that INSPIRE
      // Using inspiring chord progressions based on phase type
      const chords = {
        'default': [261.63, 329.63, 392.00], // C major - hopeful beginning
        'void': [196.00, 246.94, 293.66], // G major low - mysterious awakening
        'awakening': [261.63, 329.63, 392.00], // C major - hope emerges
        'question': [293.66, 369.99, 440.00], // D major - contemplation
        'revelation': [329.63, 415.30, 493.88], // E major - truth revealed
        'power': [349.23, 440.00, 523.25], // F major - building strength
        'wisdom': [293.66, 369.99, 440.00, 554.37], // D major 7th - enlightenment
        'transformation': [329.63, 415.30, 493.88, 587.33], // E major 7th - rising power
        'call': [392.00, 493.88, 587.33, 698.46], // G major 7th - triumphant
        'portal': [523.25, 659.25, 783.99, 1046.50] // High C major - transcendence
      };
      
      const selectedChord = chords[phaseType] || chords['default'];
      
      // Create rich, layered sound with multiple oscillators
      selectedChord.forEach((freq, index) => {
        // Main voice
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;
        
        // Subtle detuned voice for richness
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.005; // Slight detune for chorus effect
        
        // Create individual gain for each voice
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.03 / selectedChord.length, now + 0.5); // Gentle fade in
        
        // Connect oscillators
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(gainNodeRef.current);
        
        // Start oscillators
        osc1.start(now);
        osc2.start(now);
        
        oscillators.push(osc1, osc2);
      });
      
      oscillatorRef.current = oscillators;
    } catch (e) {
      console.log('Could not play sound');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase >= narrativePhases.length) {
      if (oscillatorRef.current) {
        if (Array.isArray(oscillatorRef.current)) {
          oscillatorRef.current.forEach(osc => osc.stop());
        } else {
          oscillatorRef.current.stop();
        }
      }
      setTimeout(onComplete, 1000);
      return;
    }

    const currentPhase = narrativePhases[phase];
    
    // Play INSPIRING music for different phases
    if (audioEnabled) {
      playAmbientSound(currentPhase.type);
    }
    
    const timer = setTimeout(() => {
      setPhase(prev => prev + 1);
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [phase, onComplete, audioEnabled]);

  const currentPhase = narrativePhases[phase] || narrativePhases[narrativePhases.length - 1];

  const renderPhase = () => {
    switch (currentPhase.type) {
      case 'void':
        return (
          <motion.div className="flex items-center justify-center h-full relative">
            {/* Gravitational core pulse */}
            <motion.div
              className="absolute"
              animate={{ 
                scale: [0, 50, 100],
                opacity: [0, 0.4, 0]
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-[#d4a574] shadow-[0_0_100px_50px_rgba(212,165,116,0.6)]" />
            </motion.div>
            
            {/* Awakening heartbeat */}
            <motion.div
              animate={{ 
                scale: [1, 2.5, 1],
                opacity: [0.8, 0.3, 0.8]
              }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full bg-gradient-radial from-[#ffd700] to-[#d4a574] shadow-[0_0_80px_rgba(255,215,0,1)]"
            />
          </motion.div>
        );

      case 'awakening':
        return (
          <motion.div className="text-center space-y-6 px-4">
            {/* Camera zoom effect - words appear with depth */}
            <motion.div
              initial={{ scale: 10, opacity: 0, z: -1000 }}
              animate={{ scale: 1, opacity: 1, z: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="relative"
            >
              {currentPhase.text.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 100, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.15 * i, duration: 0.6, ease: "easeOut" }}
                  className="inline-block text-5xl md:text-7xl lg:text-8xl font-bold text-white mr-4 md:mr-6"
                  style={{
                    textShadow: '0 0 60px rgba(255,215,0,0.8), 0 20px 40px rgba(0,0,0,0.8)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            
            {currentPhase.subtext && (
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-2xl md:text-4xl text-[#d4a574] font-light italic"
                style={{ textShadow: '0 0 30px rgba(212,165,116,0.5)' }}
              >
                {currentPhase.subtext}
              </motion.p>
            )}
            
            {/* Volumetric light rays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: 2,
                    height: '150%',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,215,0,0.2), transparent)',
                    transformOrigin: 'top center',
                    rotate: (i * 45) + 'deg',
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scaleY: [0, 1, 0]
                  }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 1.5, ease: "easeOut" }}
                />
              ))}
            </div>
          </motion.div>
        );

      case 'revelation':
        return (
          <motion.div className="text-center px-4 relative">
            {/* Shockwave expand */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="w-64 h-64 rounded-full border-4 border-[#ffd700]/60" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.1em' }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl text-gray-300 font-light mb-8"
            >
              {currentPhase.text}
            </motion.p>
            
            {/* Explosive text reveal */}
            <div className="relative">
              {currentPhase.highlight.split(' ').map((word, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.3,
                    rotateY: 180,
                    z: -500
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    rotateY: 0,
                    z: 0
                  }}
                  transition={{ 
                    delay: 0.8 + i * 0.15,
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
                    type: "spring",
                    stiffness: 100
                  }}
                  className="inline-block"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <span 
                    className="text-5xl md:text-7xl lg:text-9xl font-black mr-4 inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #fff 50%, #ffd700 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 60px rgba(255,215,0,0.9)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  >
                    {word}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'triple_wisdom':
        return (
          <motion.div className="relative h-full flex items-center justify-center px-4">
            {/* Three wisdom sources converge */}
            <div className="relative w-full max-w-6xl">
              {currentPhase.quotes.map((quote, i) => {
                const positions = [
                  { x: -400, y: -200, rotate: -15 }, // Left
                  { x: 0, y: -250, rotate: 0 },     // Center
                  { x: 400, y: -200, rotate: 15 }   // Right
                ];
                
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-80 md:w-96"
                    initial={{ 
                      x: positions[i].x,
                      y: positions[i].y,
                      rotate: positions[i].rotate,
                      opacity: 0,
                      scale: 0.5
                    }}
                    animate={{ 
                      x: 0,
                      y: i * 100 - 100,
                      rotate: 0,
                      opacity: 1,
                      scale: 1
                    }}
                    transition={{ 
                      delay: i * 0.6,
                      duration: 1,
                      type: "spring",
                      stiffness: 80
                    }}
                    style={{ transformOrigin: 'center center' }}
                  >
                    <motion.div
                      className="relative p-6 rounded-2xl backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${quote.color}15, transparent)`,
                        border: `2px solid ${quote.color}40`,
                        boxShadow: `0 0 60px ${quote.color}40`
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Icon burst */}
                      <motion.div
                        className="absolute -top-8 left-1/2 -translate-x-1/2"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.6 + 0.3, type: "spring" }}
                      >
                        <span className="text-5xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
                          {quote.icon}
                        </span>
                      </motion.div>
                      
                      <p className="text-lg md:text-xl text-white font-medium text-center mt-4 leading-relaxed">
                        "{quote.text}"
                      </p>
                      <p 
                        className="text-sm md:text-base font-bold text-center mt-3 tracking-wider"
                        style={{ color: quote.color }}
                      >
                        — {quote.author}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
              
              {/* Convergence point light */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 3, 6] }}
                transition={{ delay: 2.5, duration: 1.5 }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-radial from-white via-[#ffd700] to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        );

      case 'explosion':
        return (
          <motion.div className="text-center space-y-8 px-4 relative">
            {/* Energy gathering */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-40"
                  style={{
                    background: `linear-gradient(to top, transparent, ${['#d4a574', '#60a5fa', '#10b981'][i % 3]})`,
                    rotate: (i * 30) + 'deg',
                    transformOrigin: 'center center'
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ delay: i * 0.1, duration: 1.2 }}
                />
              ))}
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl text-gray-300 font-light"
            >
              {currentPhase.text}
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-4xl text-[#d4a574]"
            >
              {currentPhase.subtext}
            </motion.p>
            
            {/* NAME EXPLOSION */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.001 }}
            >
              <motion.h1
                className="text-8xl md:text-9xl lg:text-[14rem] font-black leading-none"
                initial={{ scale: 0.5, rotateZ: -180, filter: 'blur(20px)' }}
                animate={{ 
                  scale: [0.5, 1.2, 1],
                  rotateZ: 0,
                  filter: 'blur(0px)'
                }}
                transition={{ 
                  duration: 1,
                  delay: 1.2,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #fff 20%, #ffd700 40%, #fff 60%, #ffd700 80%, #fff 100%)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 80px rgba(255,215,0,1)) drop-shadow(0 0 40px rgba(255,255,255,0.8))',
                  animation: 'shimmer 1.5s linear infinite',
                  letterSpacing: '0.1em'
                }}
              >
                {currentPhase.highlight}
              </motion.h1>
              
              {/* Shockwave rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ delay: 1.2 + i * 0.2, duration: 1.5, ease: "easeOut" }}
                >
                  <div 
                    className="w-96 h-96 rounded-full"
                    style={{
                      border: `${4 - i}px solid rgba(255,215,0,${0.8 - i * 0.2})`
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        );

      case 'ascension':
        return (
          <motion.div className="flex items-center justify-center h-full relative overflow-hidden">
            {/* Rising light columns */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${i * 5}%`,
                  width: '2%',
                  height: '100%',
                  background: `linear-gradient(to top, ${['#d4a574', '#ffd700', '#60a5fa', '#10b981'][i % 4]}, transparent)`,
                  opacity: 0.3
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.6 }}
                transition={{ 
                  delay: i * 0.05,
                  duration: 1.5,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Center portal/door opening */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <motion.p
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,215,0,0.5)',
                    '0 0 60px rgba(255,215,0,1), 0 0 100px rgba(255,255,255,0.8)',
                    '0 0 20px rgba(255,215,0,0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentPhase.text}
              </motion.p>
            </motion.div>
            
            {/* White flash transition */}
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ delay: 2, duration: 0.5 }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] overflow-hidden" style={{ perspective: 1000 }}>
      {/* Deep space layers - parallax depth */}
      <div className="absolute inset-0">
        {/* Layer 1: Distant stars */}
        {[...Array(150)].map((_, i) => {
          const size = Math.random() * 2 + 0.5;
          const depth = Math.random();
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.2 + depth * 0.5,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          );
        })}
        
        {/* Layer 2: Nebula clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 400 + Math.random() * 200,
              height: 400 + Math.random() * 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['rgba(212,165,116,0.1)', 'rgba(255,215,0,0.08)', 'rgba(96,165,250,0.06)', 'rgba(16,185,129,0.06)'][i % 4]
              }, transparent)`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Dynamic volumetric fog */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 40%, rgba(212, 165, 116, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse at 70% 60%, rgba(255, 215, 0, 0.12) 0%, transparent 50%)',
            'radial-gradient(ellipse at 50% 50%, rgba(96, 165, 250, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse at 30% 40%, rgba(212, 165, 116, 0.08) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Phase-reactive energy particles with physics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => {
          const colorOptions = ['#d4a574', '#ffd700', '#60a5fa', '#10b981'];
          const color = colorOptions[i % 4];
          const startX = Math.random() * 100;
          const drift = (Math.random() - 0.5) * 400;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: `radial-gradient(circle, ${color}, transparent)`,
                left: `${startX}%`,
                bottom: '-30px',
                boxShadow: `0 0 ${Math.random() * 30 + 20}px ${color}`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -window.innerHeight - 300],
                x: [0, drift, drift * 0.7],
                opacity: [0, 0.8, 1, 0.6, 0],
                scale: [0, 1.2, 1, 0.8, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </div>
      
      {/* Depth field - 3D layering effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60"
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={phase}
            className="w-full max-w-7xl"
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced progress indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {narrativePhases.map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full transition-all duration-500 relative overflow-hidden ${
              i <= phase ? 'bg-[#d4a574]' : 'bg-gray-700'
            }`}
            style={{ width: i === phase ? 32 : 12 }}
          >
            {i === phase && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Audio toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        onClick={() => setAudioEnabled(!audioEnabled)}
        className="absolute top-8 right-24 sm:right-32 text-gray-400 hover:text-[#d4a574] transition-colors p-3 rounded-full hover:bg-white/5"
      >
        {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </motion.button>

      {/* Skip button */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6, y: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
            className="absolute bottom-12 right-8 text-gray-400 hover:text-[#d4a574] transition-all text-sm tracking-wider px-6 py-3 rounded-full border border-gray-700 hover:border-[#d4a574] hover:bg-[#d4a574]/10"
          >
            SKIP INTRO →
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
      `}</style>
    </div>
  );
};

export default CinematicIntro;