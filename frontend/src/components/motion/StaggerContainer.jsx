import React from 'react';
import { motion } from 'framer-motion';
import { useAdaptiveVariants } from '../../lib/motion';

/**
 * A container that staggers the entrance of its children.
 * Should be used with children wrapped in motion components using the `item` variant.
 */
export const StaggerContainer = ({ children, className, as = 'div', ...props }) => {
  const { staggerContainer } = useAdaptiveVariants();
  const Component = motion[as];

  return (
    <Component
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export const AnimatedTableRow = ({ children, className, ...props }) => {
  const { item } = useAdaptiveVariants();

  return (
    <motion.tr
      variants={item}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  );
};

export const AnimatedListItem = ({ children, className, as = 'div', ...props }) => {
  const { item } = useAdaptiveVariants();
  const Component = motion[as];

  return (
    <Component
      variants={item}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
