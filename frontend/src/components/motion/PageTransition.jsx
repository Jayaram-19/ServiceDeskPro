import React from 'react';
import { motion } from 'framer-motion';
import { useAdaptiveVariants } from '../../lib/motion';

const PageTransition = ({ children, className }) => {
  const { page } = useAdaptiveVariants();

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full h-full ${className || ''}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
