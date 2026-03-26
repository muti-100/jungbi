'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  valueColor = 'text-gray-800',
  iconColor = 'text-blue-600',
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 h-[120px] flex flex-col justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl p-4 h-[120px] flex flex-col justify-between transition-shadow duration-150 hover:shadow-md"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2">
        <Icon size={20} className={iconColor} strokeWidth={1.5} aria-hidden="true" />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</div>
      <div className="text-xs text-gray-400">{subtext}</div>
    </div>
  );
}
