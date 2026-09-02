import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdaptiveVariants } from '../../lib/motion';
import { X } from 'lucide-react';

export const AnimatedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  className = "max-w-md w-full"
}) => {
  const { modal, fade } = useAdaptiveVariants();
  const modalRef = useRef(null);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            key="modal"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            ref={modalRef}
            className={`relative bg-card text-card-foreground shadow-lg rounded-xl border border-border flex flex-col max-h-[90vh] ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {!title && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors z-10"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="overflow-y-auto p-4 flex-1">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;
