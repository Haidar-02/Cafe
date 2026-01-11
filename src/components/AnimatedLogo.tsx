"use client";

import React from 'react';
import { motion } from "framer-motion";

interface AnimatedLogoProps {
  className?: string;
}

export const AnimatedLogo = ({ className = "h-16 w-16" }: AnimatedLogoProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -5, 0] 
      }}
      transition={{
        scale: { duration: 0.5 },
        opacity: { duration: 0.5 },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="relative z-10 w-full h-full object-contain filter drop-shadow-xl" 
      />
    </motion.div>
  );
};