'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface WruButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow-md disabled:bg-primary-300',
  secondary:
    'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white shadow-sm hover:shadow-md disabled:bg-secondary-300',
  ghost:
    'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 disabled:text-gray-400',
  danger:
    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm hover:shadow-md disabled:bg-red-300',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
  xl: 'h-14 px-8 text-lg rounded-2xl gap-2.5',
}

export function WruButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: WruButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'select-none cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2
          className="animate-spin shrink-0"
          size={size === 'sm' ? 14 : size === 'xl' ? 20 : 16}
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}

export default WruButton
