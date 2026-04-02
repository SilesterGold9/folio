import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Modal = ({ isOpen, onClose, title, children, actions }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute z-[101] left-6 right-6 top-1/2 -translate-y-1/2 bg-[var(--bg-card)] rounded-3xl shadow-2xl p-6 border border-[var(--border-subtle)]"
          >
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-4 font-display">{title}</h3>
            <div className="mb-6 text-[var(--text-muted)]">{children}</div>
            <div className="flex justify-end gap-3">{actions}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
