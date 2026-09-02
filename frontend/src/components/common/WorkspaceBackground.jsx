import React, { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const WorkspaceBackground = ({ children }) => {
  const root = useRef(null);
  const pointerFrame = useRef(null);
  const reduceMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType === 'touch' || !root.current) return;
    cancelAnimationFrame(pointerFrame.current);
    const { clientX, clientY } = event;
    pointerFrame.current = requestAnimationFrame(() => {
      root.current.style.setProperty('--pointer-x', `${clientX}px`);
      root.current.style.setProperty('--pointer-y', `${clientY}px`);
    });
  };

  return (
    <div 
      ref={root} 
      onPointerMove={handlePointerMove} 
      className="relative flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-ring selection:text-white"
    >
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 opacity-80" 
        style={{ 
          backgroundImage: 'radial-gradient(500px circle at var(--pointer-x, 72%) var(--pointer-y, 12%), rgba(177,128,88,.15), transparent 48%), radial-gradient(700px circle at 78% 35%, rgba(221,193,158,.25), transparent 55%)' 
        }} 
      />
      {children}
    </div>
  );
};

export default WorkspaceBackground;
