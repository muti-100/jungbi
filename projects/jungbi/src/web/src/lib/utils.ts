import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names with clsx support.
 * Use this everywhere instead of string concatenation.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string (ISO) to Korean locale display.
 */
export function formatKoreanDate(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return '미정'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '날짜 오류'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Calculate days until a target date. Negative = past due.
 */
export function daysUntil(targetDateStr: string | null | undefined): number | null {
  if (!targetDateStr) return null
  const target = new Date(targetDateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format a D-day string: "D-7", "D+3", "오늘"
 */
export function formatDday(targetDateStr: string | null | undefined): string {
  const days = daysUntil(targetDateStr)
  if (days === null) return ''
  if (days === 0) return '오늘'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}

/**
 * Truncate a string to maxLength with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

/**
 * Generate a random UUID (client-side only, for optimistic UI).
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Format file size bytes to human-readable string.
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return '알 수 없음'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
