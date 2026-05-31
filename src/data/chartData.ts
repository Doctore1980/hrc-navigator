/**
 * Chart data derived entirely from trials.ts to avoid duplication drift.
 * Never hardcode values here that already exist in trial endpoint definitions.
 */
import { trials } from './trials'

function endpointValue(trialId: string, type: 'MFS' | 'OS') {
  return trials.find((t) => t.id === trialId)?.endpoints.find((e) => e.type === type)
}

export const mfsComparison = ['stampedem0', 'proteus', 'enzarad'].map((id) => {
  const ep = endpointValue(id, 'MFS')
  const trial = trials.find((t) => t.id === id)
  return {
    trial: trial?.shortName ?? id,
    intensified: ep?.experimental ?? 0,
    control: ep?.comparator ?? 0,
    hazardRatio: ep?.hazardRatio ?? 0,
    absolute: ep?.absoluteDelta ?? 0,
  }
})

export const osComparison = ['stampedem0', 'enzarad'].map((id) => {
  const ep = endpointValue(id, 'OS')
  const trial = trials.find((t) => t.id === id)
  return {
    trial: trial?.shortName ?? id,
    intensified: ep?.experimental ?? 0,
    control: ep?.comparator ?? 0,
    hazardRatio: ep?.hazardRatio ?? 0,
    absolute: ep?.absoluteDelta ?? 0,
  }
})

/** Toxicity comparison derived from trial endpoints — no manual duplication */
export const toxicityComparison = trials
  .filter((t) => t.maturity !== 'Pending')
  .map((t) => {
    const tox = t.endpoints.find((e) => e.type === 'Toxicity')
    return {
      trial: t.shortName,
      intensified: tox?.experimental ?? 0,
      control: tox?.comparator ?? 0,
      note: tox?.interpretation?.slice(0, 50) ?? '',
    }
  })

export const absoluteBenefit = [
  { endpoint: 'STAMPEDE MFS', benefit: endpointValue('stampedem0', 'MFS')?.absoluteDelta ?? 13, trial: 'STAMPEDE' },
  { endpoint: 'STAMPEDE OS', benefit: endpointValue('stampedem0', 'OS')?.absoluteDelta ?? 9, trial: 'STAMPEDE' },
  { endpoint: 'PROTEUS pCR/MRD', benefit: 7.9, trial: 'PROTEUS' },
  { endpoint: 'PROTEUS MFS', benefit: endpointValue('proteus', 'MFS')?.absoluteDelta ?? 4.7, trial: 'PROTEUS' },
  { endpoint: 'ENZARAD OS', benefit: endpointValue('enzarad', 'OS')?.absoluteDelta ?? 3, trial: 'ENZARAD' },
  { endpoint: 'ENZARAD MFS', benefit: endpointValue('enzarad', 'MFS')?.absoluteDelta ?? 2, trial: 'ENZARAD' },
]
