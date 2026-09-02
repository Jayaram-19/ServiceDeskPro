import React from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const AnimatedOutlet = () => {
  const outlet = useOutlet();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        {outlet}
      </PageTransition>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
