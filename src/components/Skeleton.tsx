import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton = ({ className = '', variant = 'rectangular' }: SkeletonProps) => {
  const baseClass = "bg-[var(--bg-secondary)] relative overflow-hidden";
  
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    rectangular: "rounded-xl",
    circular: "rounded-full",
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent opacity-30"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export const EditorSkeleton = () => (
  <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] p-12 space-y-8">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-1/3" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 circular" />
        <Skeleton className="h-10 w-10 circular" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-6 w-4/6" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  </div>
);

export const SidebarSkeleton = () => (
  <div className="w-64 h-full border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 space-y-6">
    <div className="flex items-center gap-3 mb-8">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
    <div className="pt-8 space-y-4">
      <Skeleton className="h-4 w-16" />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const NoteListSkeleton = () => (
  <div className="w-80 h-full border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 space-y-6">
    <Skeleton className="h-10 w-full mb-8" />
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);
