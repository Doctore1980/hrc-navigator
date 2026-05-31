import { CheckCircle2, CircleDotDashed, TrendingUp } from 'lucide-react'
import { deriveRiskLabel, scoreAllTrials } from '../lib/compatibility'
import type { PatientProfile } from '../types/evidence'
import { Card, ScoreMeter } from './ui'

const TRIAL_LABEL: Record<string, string> = {
  stampedem0: 'STAMPEDE',
  proteus: 'PROTEUS',
  enzarad: 'ENZARAD',
}

const PATHWAY_DETAIL: Record<string, string> = {
  stampedem0: 'RT + long-term ADT; consider STAMPEDE-like abiraterone intensification if fit.',
  proteus: 'Surgical pathway; PROTEUS-like perioperative apalutamide evidence most applicable.',
  enzarad: 'RT pathway — ENZARAD is contextual; enzalutamide is not a strong substitute for abiraterone.',
}

export function PathwayGraph({ patient }: { patient: PatientProfile }) {
  const recommendations = scoreAllTrials(patient)
  const top = recommendations[0]

  const nodes = [
    {
      label: 'Patient profile',
      detail: `${patient.age} y, PSA ${patient.psa} ng/mL, ${patient.clinicalStage}, ${patient.nodeStatus}`,
      done: true,
    },
    {
      label: 'Staging context',
      detail: patient.psmaPetAvailable
        ? 'PSMA PET-informed M0 assessment — modern staging confidence.'
        : 'Conventional staging only — PSMA PET not available, M0 confidence reduced.',
      done: true,
    },
    {
      label: 'Risk classification',
      detail: deriveRiskLabel(patient),
      done: true,
    },
    {
      label: 'Recommended pathway',
      detail: top ? PATHWAY_DETAIL[top.trialId] ?? 'Review trial evidence' : '—',
      done: false,
      score: top?.score,
      confidence: top?.confidence,
      trialName: top ? (TRIAL_LABEL[top.trialId] ?? top.trialId) : '—',
    },
    {
      label: 'Follow-up planning',
      detail: 'PSA kinetics monitoring, toxicity surveillance, imaging on biochemical or clinical concern.',
      done: false,
    },
  ]

  return (
    <Card className="p-4" aria-label="Treatment pathway workflow">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        <TrendingUp size={15} className="text-cyan-300" aria-hidden="true" />
        Clinical pathway
      </div>
      <ol className="space-y-0" aria-label="Pathway steps">
        {nodes.map((node, index) => (
          <li key={node.label} className="grid grid-cols-[32px_1fr] gap-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  node.done
                    ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-300'
                    : 'border-cyan-300/30 bg-cyan-300/8 text-cyan-200'
                }`}
                aria-hidden="true"
              >
                {node.done ? <CheckCircle2 size={14} /> : <CircleDotDashed size={14} />}
              </div>
              {index < nodes.length - 1 ? (
                <div className="my-1.5 h-6 w-px bg-white/12" aria-hidden="true" />
              ) : null}
            </div>

            {/* Content */}
            <div className={`${index < nodes.length - 1 ? 'pb-4' : 'pb-1'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">{node.label}</span>
                {'trialName' in node && node.trialName ? (
                  <span className="rounded-md border border-cyan-300/25 bg-cyan-300/8 px-2 py-0.5 text-xs font-medium text-cyan-200">
                    {node.trialName}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{node.detail}</p>
              {'score' in node && node.score !== undefined && node.confidence ? (
                <div className="mt-2">
                  <ScoreMeter score={node.score} confidence={node.confidence} size="sm" />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
