'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-200 disabled:text-neutral-400',
  secondary:
    'bg-white text-primary-600 border border-primary-600 hover:bg-primary-050 active:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-400',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
  danger:
    'bg-danger-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-neutral-200 disabled:text-neutral-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className,
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 12 : 16} className="animate-spin shrink-0" aria-hidden />
      ) : icon ? (
        <span className="shrink-0" aria-hidden>{icon}</span>
      ) : null}
      {children}
    </button>
  )
})
