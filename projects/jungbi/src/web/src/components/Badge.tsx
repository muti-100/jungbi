'use client';

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
