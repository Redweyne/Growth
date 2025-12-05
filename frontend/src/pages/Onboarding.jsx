import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Crown, Zap, Mountain, ArrowRight, 
  Target, Flame, BookOpen, TrendingUp,
  Brain, Heart, Star, Sparkles
} from 'lucide-react';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState(null);
  const firstName = user?.name?.split(' ')[0] || 'Champion';

  // NO TYPING. Just smart choices.
  const steps = [
    {
      title: `Welcome, ${firstName}`,
      subtitle: "Let's get you started in 30 seconds",
      question: "What matters most to you right now?",
      options: [
        { id: 'career', icon: TrendingUp, label: 'Career & Success', color: 'from-blue-500 to-indigo-600' },
        { id: 'health', icon: Flame, label: 'Health & Energy', color: 'from-emerald-500 to-teal-600' },
        { id: 'learning', icon: Brain, label: 'Learning & Growth', color: 'from-purple-500 to-pink-600' },
        { id: 'purpose', icon: Heart, label: 'Purpose & Meaning', color: 'from-amber-500 to-orange-600' }
      ]
    },
    {
      title: "Choose your guide",
      subtitle: "Pick the philosophy that resonates",
      question: "How do you want to approach growth?",
      options: [
        { 
          id: 'think_and_grow_rich', 
          icon: Crown, 
          label: 'Think Big', 
          author: 'Napoleon Hill',
          description: 'Master the power of desire and faith',
          color: 'from-amber-500 to-yellow-600'
        },
        { 
          id: 'atomic_habits', 
          icon: Zap, 
          label: 'Build Systems', 
          author: 'James Clear',
          description: 'Small changes, remarkable results',
          color: 'from-blue-500 to-indigo-600'
        },
        { 
          id: 'obstacle_is_the_way', 
          icon: Mountain, 
          label: 'Embrace Challenges', 
          author: 'Ryan Holiday',
          description: 'Transform obstacles into opportunities',
          color: 'from-emerald-500 to-teal-600'
        }
      ]
    },
    {
      title: "Daily commitment",
      subtitle: "How much time will you invest?",
      question: "Start small. Build consistency.",
      options: [
        { id: '5min', label: '5 min', description: '30+ hours/year', icon: Target },
        { id: '15min', label: '15 min', description: '91+ hours/year', icon: Target },
        { id: '30min', label: '30 min', description: '182+ hours/year', icon: Target },
        { id: '60min', label: '60+ min', description: '365+ hours/year', icon: Target }
      ]
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleSelect = (optionId) => {
    setSelection(optionId);
    
    // Auto-advance after selection with a brief pause
    setTimeout(() => {
      if (isLastStep) {
        completeOnboarding(optionId);
      } else {
        setStep(step + 1);
        setSelection(null);
      }
    }, 400);
  };

  const completeOnboarding = (lastSelection) => {
    const preferences = {
      primaryGoal: step === 0 ? lastSelection : null,
      preferredPhilosophy: step === 1 ? lastSelection : null,
      dailyCommitment: step === 2 ? lastSelection : null,
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    onComplete(preferences);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4a574]/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === step ? 'w-12 bg-[#d4a574]' : idx < step ? 'w-6 bg-[#d4a574]/50' : 'w-3 bg-gray-800'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-black/50 backdrop-blur-xl rounded-3xl border border-[#d4a574]/20 p-8 md:p-12 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-10 space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {currentStep.title}
              </h1>
              <p className="text-gray-400 text-lg">{currentStep.subtitle}</p>
              <p className="text-[#d4a574] text-xl font-light pt-4">{currentStep.question}</p>
            </div>

            {/* Options */}
            <div className={`grid gap-4 ${
              currentStep.options.length === 4 ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {currentStep.options.map((option) => {
                const Icon = option.icon;
                const isSelected = selection === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative p-6 rounded-2xl text-left transition-all duration-300
                      ${isSelected 
                        ? 'ring-2 ring-[#d4a574] bg-[#d4a574]/10' 
                        : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-lg shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1">{option.label}</h3>
                        {option.author && (
                          <p className="text-sm text-gray-400 mb-2">by {option.author}</p>
                        )}
                        {option.description && (
                          <p className="text-gray-300 text-sm">{option.description}</p>
                        )}
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-[#d4a574] flex items-center justify-center shrink-0"
                        >
                          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Skip option */}
            <div className="text-center mt-8">
              <button
                onClick={() => completeOnboarding(null)}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Skip for now →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;