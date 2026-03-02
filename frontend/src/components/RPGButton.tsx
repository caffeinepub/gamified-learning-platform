import React from 'react';
import { cn } from '@/lib/utils';

interface RPGButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'emerald' | 'crimson' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function RPGButton({
  variant = 'gold',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: RPGButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        'rpg-btn',
        `rpg-btn-${variant}`,
        sizeClasses[size],
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  );
}
