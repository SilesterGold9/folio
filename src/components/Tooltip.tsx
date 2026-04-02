import React, { useState, useEffect, useRef, cloneElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export const Tooltip = ({ children, content, position = 'bottom' }: { children: React.ReactNode, content: string, position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLElement>(null);
  
  // Delay tooltip to prevent flashing during quick mouse movements
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered) {
      timer = setTimeout(() => {
        if (childRef.current) {
          const rect = childRef.current.getBoundingClientRect();
          let top = 0;
          let left = 0;
          
          if (position === 'top') {
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
          } else if (position === 'bottom') {
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
          } else if (position === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
          } else if (position === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
          }
          
          setCoords({ top, left });
          setIsVisible(true);
        }
      }, 300);
    } else {
      setIsVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered, position]);

  const transformClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2'
  };

  const animationProps = {
    top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 5 } },
    bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } },
    left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 5 } },
    right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -5 } }
  };

  const child = isValidElement(children) ? children : <span>{children}</span>;
  
  const clonedChild = cloneElement(child as React.ReactElement<any>, {
    ref: childRef,
    onMouseEnter: (e: React.MouseEvent) => {
      setIsHovered(true);
      if ((child as React.ReactElement<any>).props.onMouseEnter) {
        (child as React.ReactElement<any>).props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setIsHovered(false);
      if ((child as React.ReactElement<any>).props.onMouseLeave) {
        (child as React.ReactElement<any>).props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      setIsHovered(true);
      if ((child as React.ReactElement<any>).props.onFocus) {
        (child as React.ReactElement<any>).props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      setIsHovered(false);
      if ((child as React.ReactElement<any>).props.onBlur) {
        (child as React.ReactElement<any>).props.onBlur(e);
      }
    }
  });

  return (
    <>
      {clonedChild}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div 
              {...animationProps[position]}
              transition={{ duration: 0.15 }}
              style={{ top: coords.top, left: coords.left, zIndex: 999999 }}
              className={`fixed ${transformClasses[position]} px-2.5 py-1.5 bg-[var(--text-main)] text-[var(--bg-primary)] text-[12px] rounded-lg whitespace-nowrap pointer-events-none font-semibold shadow-lg tracking-wide`}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
