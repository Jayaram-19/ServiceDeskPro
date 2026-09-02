import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdaptiveVariants } from '../../lib/motion';
import { X } from 'lucide-react';

export const SlideOverDrawer = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  direction = 'right', 
  className = "w-80 md:w-96" 
}) => {
  const { drawerRight, drawerLeft, fade } = useAdaptiveVariants();
  const variants = direction === 'right' ? drawerRight : drawerLeft;
  const drawerRef = useRef(null);

  // Trap focus & close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm"
          style={{ justifyContent: direction === 'right' ? 'flex-end' : 'flex-start' }}
        >
          <motion.div
            key="drawer"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            ref={drawerRef}
            drag={direction === 'left' ? 'x' : false} // Simple gesture: swipe left on left drawer
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (direction === 'left' && (offset.x < -100 || velocity.x < -500)) {
                onClose();
              }
            }}
            className={`h-full bg-card border-border shadow-2xl flex flex-col ${direction === 'right' ? 'border-l' : 'border-r'} ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 id="drawer-title" className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideOverDrawer;
