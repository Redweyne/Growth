import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Crown, Zap, Mountain, ChevronRight, ChevronLeft, 
  Sparkles, Target, Heart, Brain, Flame, Star,
  Eye, Feather, Sun, Moon, Shield, Compass
} from 'lucide-react';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    primaryGoal: null,
    preferredPhilosophy: null,
    dailyCommitment: null,
    currentChallenge: null,
    burningDesire: '',
    biggestFear: '',
    futureVision: '',
  });
  const [fadeIn, setFadeIn] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'Seeker';

  // Cinematic transition
  const transitionToStep = (newStep) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(newStep);
      setFadeIn(true);
    }, 400);
  };

  const steps = [
    // Step 0: The Awakening - Deep personal question
    {
      type: 'deep_question',
      icon: Eye,
      preText: 'Before we begin...',
      title: 'Close your eyes for a moment.',
      subtitle: 'Think about the person you were meant to become.',
      prompt: 'What is your burning desire? The ONE thing that, if achieved, would make everything else worthwhile?',
      placeholder: 'Write freely. This is between you and your destiny...',
      key: 'burningDesire',
      wisdom: '"The starting point of all achievement is DESIRE. Keep this constantly in mind. Weak desires bring weak results." — Napoleon Hill',
      minLength: 20,
    },
    // Step 1: Confronting Fear
    {
      type: 'deep_question',
      icon: Shield,
      preText: 'Now, the harder question...',
      title: 'What stands between you and that vision?',
      subtitle: 'Name your obstacle. Give it form.',
      prompt: 'What is your biggest fear? What has stopped you before?',
      placeholder: 'Be honest. Naming your fear takes away its power...',
      key: 'biggestFear',
      wisdom: '"We suffer more often in imagination than in reality." — Seneca',
      minLength: 15,
    },
    // Step 2: The Vision
    {
      type: 'deep_question',
      icon: Sun,
      preText: 'One year from now...',
      title: 'Imagine you\'ve achieved it.',
      subtitle: 'You wake up as the person you want to be.',
      prompt: 'Describe that morning. What does your life look like? How do you feel?',
      placeholder: 'Paint the picture. The more vivid, the more real it becomes...',
      key: 'futureVision',
      wisdom: '"Whatever the mind can conceive and believe, it can achieve." — Napoleon Hill',
      minLength: 20,
    },
    // Step 3: Philosophy Choice - Now they're emotionally primed
    {
      type: 'philosophy',
      icon: Compass,
      preText: 'Your path is clearer now.',
      title: 'Choose your guiding philosophy',
      subtitle: 'Which resonates with your soul?',
      options: [
        { 
          id: 'think_and_grow_rich', 
          icon: Crown, 
          label: 'Think and Grow Rich', 
          author: 'Napoleon Hill',
          quote: '"Whatever the mind can conceive and believe, it can achieve."',
          color: 'from-amber-500 to-yellow-600',
          description: 'Master the power of thought, desire, and unwavering faith',
          forYou: 'For those who dare to dream BIG'
        },
        { 
          id: 'atomic_habits', 
          icon: Zap, 
          label: 'Atomic Habits', 
          author: 'James Clear',
          quote: '"You do not rise to the level of your goals. You fall to the level of your systems."',
          color: 'from-blue-500 to-indigo-600',
          description: 'Build unshakeable systems through tiny, consistent changes',
          forYou: 'For those who believe in the power of small steps'
        },
        { 
          id: 'obstacle_is_the_way', 
          icon: Mountain, 
          label: 'The Obstacle Is The Way', 
          author: 'Ryan Holiday',
          quote: '"The impediment to action advances action. What stands in the way becomes the way."',
          color: 'from-emerald-500 to-teal-600',
          description: 'Transform every obstacle into fuel for your growth',
          forYou: 'For those who refuse to be defeated'
        }
      ],
      key: 'preferredPhilosophy'
    },
    // Step 4: Commitment
    {
      type: 'commitment',
      icon: Flame,
      preText: 'The final step...',
      title: 'Make your commitment.',
      subtitle: 'How much time will you invest in yourself daily?',
      options: [
        { id: '5min', minutes: 5, label: '5 minutes', description: 'Small but mighty', insight: 'Even 5 minutes daily = 30+ hours per year of focused growth' },
        { id: '15min', minutes: 15, label: '15 minutes', description: 'Focused practice', insight: '15 minutes daily = 91+ hours per year of transformation' },
        { id: '30min', minutes: 30, label: '30 minutes', description: 'Deep work', insight: '30 minutes daily = 182+ hours per year of becoming' },
        { id: '60min', minutes: 60, label: '60+ minutes', description: 'Full immersion', insight: '60 minutes daily = 365+ hours per year of mastery' }
      ],
      key: 'dailyCommitment'
    },
    // Step 5: The Covenant
    {
      type: 'covenant',
      icon: Star,
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const canProceed = () => {
    if (currentStep.type === 'deep_question') {
      const value = selections[currentStep.key] || '';
      return value.trim().length >= (currentStep.minLength || 10);
    }
    if (currentStep.type === 'philosophy' || currentStep.type === 'commitment') {
      return selections[currentStep.key] !== null;
    }
    return true;
  };

  const handleSelect = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    setIsTyping(value.length > 0);
  };

  const handleComplete = () => {
    const preferences = {
      ...selections,
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    onComplete(preferences);
  };

  const renderDeepQuestion = () => {
    const Icon = currentStep.icon;
    return (
      <div className="space-y-8">
        {/* Pre-text */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-[#d4a574] text-sm uppercase tracking-[0.3em] font-medium"
        >
          {currentStep.preText}
        </motion.p>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#d4a574]/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center border border-[#d4a574]/30">
              <Icon className="w-10 h-10 text-[#d4a574]" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {currentStep.title}
          </h1>
          <p className="text-xl text-gray-400">
            {currentStep.subtitle}
          </p>
        </motion.div>

        {/* Prompt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-lg text-gray-300 font-light"
        >
          {currentStep.prompt}
        </motion.p>

        {/* Textarea */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative"
        >
          <Textarea
            ref={textareaRef}
            value={selections[currentStep.key] || ''}
            onChange={(e) => handleTextChange(currentStep.key, e.target.value)}
            placeholder={currentStep.placeholder}
            rows={5}
            className="w-full bg-black/30 border-[#d4a574]/20 text-white text-lg leading-relaxed placeholder:text-gray-600 focus:border-[#d4a574]/50 focus:ring-1 focus:ring-[#d4a574]/20 resize-none rounded-xl p-5"
          />
          {/* Character guidance */}
          <div className="absolute bottom-3 right-3 text-xs text-gray-600">
            {(selections[currentStep.key] || '').length < currentStep.minLength ? (
              <span className="text-amber-500/70">Keep writing... ({currentStep.minLength - (selections[currentStep.key] || '').length} more)</span>
            ) : (
              <span className="text-emerald-500/70">Ready to continue</span>
            )}
          </div>
        </motion.div>

        {/* Wisdom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isTyping ? 0.3 : 0.6 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 italic max-w-lg mx-auto">
            {currentStep.wisdom}
          </p>
        </motion.div>
      </div>
    );
  };

  const renderPhilosophy = () => {
    const Icon = currentStep.icon;
    return (
      <div className="space-y-8">
        {/* Pre-text */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[#d4a574] text-sm uppercase tracking-[0.3em] font-medium"
        >
          {currentStep.preText}
        </motion.p>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {currentStep.title}
          </h1>
          <p className="text-lg text-gray-400">
            {currentStep.subtitle}
          </p>
        </motion.div>

        {/* Options */}
        <div className="space-y-4 mt-8">
          {currentStep.options.map((option, i) => {
            const OptionIcon = option.icon;
            const isSelected = selections[currentStep.key] === option.id;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => handleSelect(currentStep.key, option.id)}
                className={`
                  w-full relative p-6 rounded-2xl text-left transition-all duration-500 overflow-hidden group
                  ${isSelected 
                    ? 'ring-2 ring-[#d4a574] scale-[1.02]' 
                    : 'hover:scale-[1.01]'
                  }
                `}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${option.color} transition-opacity duration-500 ${isSelected ? 'opacity-20' : 'opacity-5 group-hover:opacity-10'}`} />
                
                {/* Glow effect when selected */}
                {isSelected && (
                  <motion.div
                    layoutId="philosophy-glow"
                    className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-10 blur-xl`}
                  />
                )}

                <div className="relative flex items-start gap-5">
                  {/* Icon */}
                  <div className={`shrink-0 p-4 rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}>
                    <OptionIcon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{option.label}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">by {option.author}</p>
                    <p className="text-gray-300 mb-3">{option.description}</p>
                    <p className="text-lg italic text-[#d4a574]/80">"{option.quote.replace(/"/g, '')}"</p>
                    <p className="text-xs text-gray-500 mt-3 uppercase tracking-wider">{option.forYou}</p>
                  </div>

                  {/* Selection indicator */}
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isSelected ? 'bg-[#d4a574] border-[#d4a574]' : 'border-gray-600'
                  }`}>
                    {isSelected && (
                      <motion.svg 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-black" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCommitment = () => {
    return (
      <div className="space-y-8">
        {/* Pre-text */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[#d4a574] text-sm uppercase tracking-[0.3em] font-medium"
        >
          {currentStep.preText}
        </motion.p>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center border border-orange-500/30">
              <Flame className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {currentStep.title}
          </h1>
          <p className="text-lg text-gray-400">
            {currentStep.subtitle}
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {currentStep.options.map((option, i) => {
            const isSelected = selections[currentStep.key] === option.id;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => handleSelect(currentStep.key, option.id)}
                className={`
                  relative p-6 rounded-2xl text-center transition-all duration-300 overflow-hidden
                  ${isSelected 
                    ? 'ring-2 ring-[#d4a574] bg-[#d4a574]/10 scale-105' 
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="relative">
                  <p className={`text-4xl font-bold mb-2 ${isSelected ? 'text-[#d4a574]' : 'text-white'}`}>
                    {option.label}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                  {isSelected && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-emerald-400 mt-2"
                    >
                      {option.insight}
                    </motion.p>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#d4a574] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCovenant = () => {
    const philosophy = steps[3].options.find(o => o.id === selections.preferredPhilosophy);
    const commitment = steps[4].options.find(o => o.id === selections.dailyCommitment);

    return (
      <div className="space-y-8 text-center">
        {/* Glowing orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          className="relative mx-auto w-32 h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574] to-[#ffd700] rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574] to-[#ffd700] rounded-full blur-xl opacity-30" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8885f] flex items-center justify-center shadow-2xl shadow-[#d4a574]/50">
            <Star className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* The Covenant */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {firstName}, you are ready.
          </h1>
          
          <div className="max-w-xl mx-auto space-y-4 text-left bg-white/5 rounded-2xl p-8 border border-[#d4a574]/20">
            <p className="text-gray-300 leading-relaxed">
              You have named your <span className="text-[#d4a574] font-semibold">burning desire</span>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              You have faced your <span className="text-[#d4a574] font-semibold">deepest fear</span>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              You have envisioned your <span className="text-[#d4a574] font-semibold">transformed future</span>.
            </p>
            {philosophy && (
              <p className="text-gray-300 leading-relaxed">
                You have chosen <span className="text-[#d4a574] font-semibold">{philosophy.label}</span> as your guide.
              </p>
            )}
            {commitment && (
              <p className="text-gray-300 leading-relaxed">
                You have committed <span className="text-[#d4a574] font-semibold">{commitment.label}</span> daily to your growth.
              </p>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-gray-400 italic"
          >
            "The journey of a thousand miles begins with a single step."
          </motion.p>
        </motion.div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep.type) {
      case 'deep_question':
        return renderDeepQuestion();
      case 'philosophy':
        return renderPhilosophy();
      case 'commitment':
        return renderCommitment();
      case 'covenant':
        return renderCovenant();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#d4a574]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#d4a574]/3 rounded-full blur-[100px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4a574]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className={`
        w-full max-w-2xl relative z-10 transition-all duration-500
        ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                h-1.5 rounded-full transition-all duration-500
                ${idx === step ? 'w-10 bg-[#d4a574]' : idx < step ? 'w-6 bg-[#d4a574]/50' : 'w-3 bg-gray-800'}
              `}
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#0d0d0d]/80 backdrop-blur-xl rounded-3xl border border-[#d4a574]/10 p-8 md:p-12 shadow-2xl shadow-black/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-800/50">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => transitionToStep(step - 1)}
                className="text-gray-500 hover:text-white hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-[#d4a574] to-[#b8885f] hover:from-[#e6b786] hover:to-[#d4a574] text-black font-semibold px-8 py-3 rounded-xl shadow-lg shadow-[#d4a574]/20"
              >
                Begin Your Transformation
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => transitionToStep(step + 1)}
                disabled={!canProceed()}
                className={`
                  px-8 py-3 rounded-xl transition-all duration-300 font-semibold
                  ${canProceed() 
                    ? 'bg-gradient-to-r from-[#d4a574] to-[#b8885f] hover:from-[#e6b786] hover:to-[#d4a574] text-black shadow-lg shadow-[#d4a574]/20' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
