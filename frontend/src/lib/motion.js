import { useReducedMotion } from 'framer-motion';

// --- Easings ---
export const easings = {
  // Snappy but smooth, good for general UI elements
  snappy: [0.175, 0.885, 0.32, 1.1], // Custom overshoot
  // Smooth and professional, standard easing
  smooth: [0.4, 0, 0.2, 1],
  // Fast out, slow in (deceleration)
  decelerate: [0.0, 0.0, 0.2, 1],
  // Slow out, fast in (acceleration)
  accelerate: [0.4, 0.0, 1, 1],
};

// --- Durations ---
export const durations = {
  fast: 0.15,
  normal: 0.22,
  slow: 0.35,
};

// --- Framer Motion Variants ---

/**
 * Standard page transition (fade in + slight slide up)
 */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: durations.fast, ease: easings.accelerate }
  },
};

/**
 * Fallback page transition for reduced motion (fade only)
 */
export const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

/**
 * Staggered container for lists/grids
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/**
 * Individual item in a staggered container
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  },
};

export const staggerItemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: durations.fast } },
};

/**
 * Modals and Dialogs
 */
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: 10,
    transition: { duration: durations.fast, ease: easings.accelerate }
  },
};

/**
 * Slide-over Drawer (from right)
 */
export const drawerVariantsRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: '0%', 
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 300 }
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: { duration: durations.normal, ease: easings.accelerate }
  },
};

/**
 * Slide-over Drawer (from left, e.g., mobile sidebar)
 */
export const drawerVariantsLeft = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: '0%', 
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 300 }
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: { duration: durations.normal, ease: easings.accelerate }
  },
};

/**
 * Simple Fade (for tooltips, badges, simple toggles)
 */
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

// --- Helper Hook ---
/**
 * Hook to get the correct variants based on user's reduced-motion preference
 */
export const useAdaptiveVariants = () => {
  const shouldReduceMotion = useReducedMotion();
  
  return {
    page: shouldReduceMotion ? pageVariantsReduced : pageVariants,
    item: shouldReduceMotion ? staggerItemReduced : staggerItem,
    staggerContainer,
    modal: modalVariants, // Usually keep basic scale for modals even in reduced, but could swap
    drawerRight: drawerVariantsRight,
    drawerLeft: drawerVariantsLeft,
    fade: fadeVariants,
    shouldReduceMotion,
  };
};
