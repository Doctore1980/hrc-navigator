import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Recommendation } from '../types/evidence'

const axis = { stroke: '#64748b', fontSize: 11 }
const tooltipStyle = {
  contentStyle: {
    background: '#0b1220',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 8,
    fontSize: 12,
  },
}

export function GroupedOutcomeChart({
  data,
  title,
  ariaLabel,
}: {
  data: Array<Record<string, number | string>>
  title: string
  ariaLabel?: string
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 text-sm font-semibold text-slate-200">{title}</div>
      <ResponsiveContainer
        width="100%"
        height={220}
        minWidth={1}
        minHeight={1}
        aria-label={ariaLabel ?? title}
      >
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 16, left: -22 }}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="trial" {...axis} />
          <YAxis {...axis} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="intensified" name="Intensified arm" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          <Bar dataKey="control" name="Control arm" fill="#475569" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AbsoluteBenefitChart({
  data,
}: {
  data: Array<{ endpoint: string; benefit: number; trial: string }>
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 text-sm font-semibold text-slate-200">Absolute benefit (Δ%)</div>
      <ResponsiveContainer
        width="100%"
        height={220}
        minWidth={1}
        minHeight={1}
        aria-label="Absolute benefit comparison across trials and endpoints"
      >
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 96 }}>
          <CartesianGrid stroke="#1f2937" horizontal={false} />
          <XAxis {...axis} type="number" tickFormatter={(v) => `${v}%`} />
          <YAxis {...axis} dataKey="endpoint" type="category" width={100} tick={{ fontSize: 10 }} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
          <Bar dataKey="benefit" name="Absolute Δ" radius={[0, 4, 4, 0]}>
            {data.map((item) => (
              <Cell
                key={item.endpoint}
                fill={item.benefit >= 9 ? '#34d399' : item.benefit >= 5 ? '#22d3ee' : '#fbbf24'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ToxicityChart({
  data,
}: {
  data: Array<Record<string, number | string>>
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 text-sm font-semibold text-slate-200">Grade ≥3 AE comparison (%)</div>
      <ResponsiveContainer
        width="100%"
        height={220}
        minWidth={1}
        minHeight={1}
        aria-label="Grade 3 or higher adverse events comparison between intensified and control arms"
      >
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 16, left: -22 }}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="trial" {...axis} tick={{ fontSize: 10 }} />
          <YAxis {...axis} domain={[0, 65]} tickFormatter={(v) => `${v}%`} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="intensified" name="Intensified arm" fill="#fb7185" radius={[4, 4, 0, 0]} />
          <Bar dataKey="control" name="Control arm" fill="#475569" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const TRIAL_LABEL_MAP: Record<string, string> = {
  stampedem0: 'STAMPEDE',
  proteus: 'PROTEUS',
  enzarad: 'ENZARAD',
}

export function RecommendationRadar({ recommendations }: { recommendations: Recommendation[] }) {
  // With 3 data points a RadarChart is a triangle — use horizontal bars instead for clarity
  const sorted = [...recommendations].sort((a, b) => b.score - a.score)

  return (
    <div
      className="space-y-3 py-2"
      aria-label="Trial compatibility scores ranked by percentage"
    >
      {sorted.map((rec) => {
        const name = TRIAL_LABEL_MAP[rec.trialId] ?? rec.trialId
        const barColor =
          rec.confidence === 'High'
            ? 'bg-emerald-400'
            : rec.confidence === 'Moderate'
              ? 'bg-cyan-400'
              : 'bg-amber-400'
        const textColor =
          rec.confidence === 'High'
            ? 'text-emerald-300'
            : rec.confidence === 'Moderate'
              ? 'text-cyan-300'
              : 'text-amber-300'

        return (
          <div key={rec.trialId} aria-label={`${name}: ${rec.score}% compatibility, ${rec.confidence} confidence`}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-20 text-sm font-semibold text-slate-100">{name}</span>
                <span className={`text-xs font-medium ${textColor}`}>{rec.confidence}</span>
              </div>
              <span className={`text-lg font-bold tabular-nums ${textColor}`}>{rec.score}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${rec.score}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Radar chart kept for visual comparison if needed — used in non-primary views */
export function CompatibilityRadar({ recommendations }: { recommendations: Recommendation[] }) {
  const data = recommendations.map((r) => ({
    trial: TRIAL_LABEL_MAP[r.trialId] ?? r.trialId,
    score: r.score,
  }))

  return (
    <div className="min-w-0">
      <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1} aria-label="Compatibility radar chart">
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="trial" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <Radar dataKey="score" fill="#22d3ee" fillOpacity={0.18} stroke="#22d3ee" strokeWidth={2} />
          <Tooltip {...tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
