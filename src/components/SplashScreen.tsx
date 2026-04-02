import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Feather, Sparkles, Shield, Zap, Wind } from 'lucide-react';
import { THEMES } from '../constants';

export const SplashScreen = ({ onComplete, themeColor }: { onComplete: () => void, themeColor?: string }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [featureIndex, setFeatureIndex] = useState(0);
  const color = themeColor || THEMES[0].color;

  const features = [
    { icon: Shield, text: "Privacy First" },
    { icon: Wind, text: "Zen Mode" },
    { icon: Sparkles, text: "AI Magic" },
    { icon: Zap, text: "Instant Search" }
  ];

  useEffect(() => {
    const featureTimer = setInterval(() => {
      setFeatureIndex(prev => (prev + 1) % features.length);
    }, 600);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearInterval(featureTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-[100] bg-[var(--bg-primary)] flex flex-col items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl"
            style={{ backgroundColor: color, boxShadow: `0 25px 50px -12px ${color}40` }}
          >
            <Feather className="w-14 h-14 text-white" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-bold tracking-tighter text-[var(--text-main)] font-display mb-8"
          >
            Folio
          </motion.h1>

          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={featureIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-[var(--text-muted)] font-medium"
              >
                {React.createElement(features[featureIndex].icon, { className: "w-4 h-4", style: { color } })}
                <span className="text-sm tracking-widest uppercase">{features[featureIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
