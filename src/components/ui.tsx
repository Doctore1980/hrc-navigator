import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-white/10 bg-white/[0.055] shadow-panel backdrop-blur', className)} {...props} />
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'green' | 'amber' | 'red' | 'blue' | 'neutral'
}) {
  const tones = {
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    red: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    blue: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    neutral: 'border-white/15 bg-white/5 text-slate-200',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95',
        className,
      )}
      {...props}
    />
  )
}

export function IconButton({ className, 'aria-label': ariaLabel, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string }) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07] text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export function MetricCard({
  label,
  value,
  sublabel,
  tone = 'blue',
}: {
  label: string
  value: string
  sublabel: string
  tone?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const accents = {
    blue: 'from-cyan-300/20 to-blue-400/5 text-cyan-200',
    green: 'from-emerald-300/20 to-lime-400/5 text-emerald-200',
    amber: 'from-amber-300/20 to-orange-400/5 text-amber-200',
    red: 'from-rose-300/20 to-red-400/5 text-rose-200',
  }
  const textColor = accents[tone].split(' ').at(-1)!
  return (
    <Card className="relative overflow-hidden p-4">
      <div className={cn('absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r', accents[tone])} />
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={cn('mt-2 text-3xl font-bold tabular-nums', textColor)}>{value}</div>
      <div className="mt-1.5 text-xs text-slate-400">{sublabel}</div>
    </Card>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">{eyebrow}</div>
        <h2 className="mt-1.5 text-2xl font-bold text-slate-50 md:text-3xl">{title}</h2>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-white/8', className)} />
}

export function ScoreMeter({
  score,
  confidence,
  size = 'md',
}: {
  score: number
  confidence: 'High' | 'Moderate' | 'Low'
  size?: 'sm' | 'md'
}) {
  const barColor =
    confidence === 'High'
      ? 'bg-emerald-400'
      : confidence === 'Moderate'
        ? 'bg-cyan-400'
        : 'bg-amber-400'
  const textColor =
    confidence === 'High'
      ? 'text-emerald-300'
      : confidence === 'Moderate'
        ? 'text-cyan-300'
        : 'text-amber-300'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold tabular-nums', textColor, size === 'sm' ? 'text-xs' : 'text-sm')}>
          {score}%
        </span>
        <span className="text-slate-500">{confidence}</span>
      </div>
      <div className={cn('overflow-hidden rounded-full bg-white/10', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
