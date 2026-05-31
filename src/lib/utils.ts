import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value?: number) {
  if (value === undefined) return 'Pending'
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}
