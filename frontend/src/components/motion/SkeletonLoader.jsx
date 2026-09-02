import React from 'react';
import { motion } from 'framer-motion';
import { useAdaptiveVariants } from '../../lib/motion';

export const Skeleton = ({ className, ...props }) => {
  const { shouldReduceMotion } = useAdaptiveVariants();

  if (shouldReduceMotion) {
    return <div className={`bg-muted rounded-md ${className}`} {...props} />;
  }

  return (
    <motion.div
      className={`bg-muted rounded-md ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};
