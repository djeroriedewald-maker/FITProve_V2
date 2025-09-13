import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedElementProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const FadeIn: React.FC<AnimatedElementProps> = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<AnimatedElementProps> = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn: React.FC<AnimatedElementProps> = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};