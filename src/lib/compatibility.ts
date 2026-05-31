import { trials } from '../data/trials'
import type { PatientProfile, Recommendation, Trial, TrialId } from '../types/evidence'
import { SCORE_BASELINE, SCORING_RULES } from './scoringRules'
import { clamp } from './utils'

export const defaultPatient: PatientProfile = {
  age: 68,
  psa: 42,
  clinicalStage: 'T3b',
  nodeStatus: 'N1',
  gleasonGradeGroup: 5,
  psmaPetAvailable: true,
  radiotherapyCandidate: true,
  surgeryCandidate: true,
  comorbidityBurden: 'Moderate',
  patientPreference: 'Radiotherapy',
}

export function highRiskFactorCount(patient: PatientProfile): number {
  let count = 0
  if (patient.psa >= 40) count += 1
  if (['T3a', 'T3b', 'T4'].includes(patient.clinicalStage)) count += 1
  if (patient.gleasonGradeGroup >= 4) count += 1
  if (patient.nodeStatus === 'N1') count += 1
  return count
}

function confidenceFor(
  score: number,
  trial: Trial,
  positiveCount: number,
  limitingCount: number,
): Recommendation['confidence'] {
  if (trial.evidenceLevel === 'Pending') return 'Low'
  // High confidence: good score AND net positive balance
  if (score >= 70 && positiveCount >= limitingCount + 2) return 'High'
  if (score >= 45) return 'Moderate'
  return 'Low'
}

export function scoreTrialCompatibility(patient: PatientProfile, trial: Trial): Recommendation {
  let score = SCORE_BASELINE
  const positiveFactors: string[] = []
  const limitingFactors: string[] = []
  const explanation: string[] = []

  for (const rule of SCORING_RULES) {
    // Apply global rules (trialId === null) and rules for this specific trial
    if (rule.trialId !== null && rule.trialId !== trial.id) continue
    if (!rule.condition(patient)) continue

    // Labels can be a string or a function receiving the patient
    const label = typeof rule.label === 'function' ? (rule.label as (p: PatientProfile) => string)(patient) : rule.label

    if (rule.factor === 'positive') {
      score += rule.delta
      positiveFactors.push(label)
      explanation.push(`+${rule.delta}: ${label}`)
    } else {
      score -= rule.delta
      limitingFactors.push(label)
      explanation.push(`−${rule.delta}: ${label}`)
    }
  }

  const finalScore = Math.round(clamp(score))
  return {
    trialId: trial.id as TrialId,
    score: finalScore,
    confidence: confidenceFor(finalScore, trial, positiveFactors.length, limitingFactors.length),
    explanation,
    positiveFactors,
    limitingFactors,
  }
}

/** Score all non-pending trials and sort by descending score */
export function scoreAllTrials(patient: PatientProfile): Recommendation[] {
  return trials
    .filter((trial) => trial.maturity !== 'Pending')
    .map((trial) => scoreTrialCompatibility(patient, trial))
    .sort((a, b) => b.score - a.score)
}

export function deriveRiskLabel(patient: PatientProfile): string {
  const count = highRiskFactorCount(patient)
  if (patient.nodeStatus === 'N1' || count >= 3) return 'Very-high-risk / systemic intensification relevant'
  if (count >= 2) return 'High-risk localized'
  return 'Borderline for this evidence set'
}

export function deriveRiskColor(patient: PatientProfile): 'red' | 'amber' | 'blue' {
  const label = deriveRiskLabel(patient)
  if (label.startsWith('Very')) return 'red'
  if (label.startsWith('High')) return 'amber'
  return 'blue'
}
