/**
 * Declarative scoring rules for trial-patient compatibility.
 *
 * Each rule is evaluated independently. Positive rules add to the score,
 * negative rules subtract. Rules are grouped by trial or are global.
 *
 * Baseline score: 42
 * Rationale: represents a moderate-high risk patient who meets basic inclusion
 * criteria for most trials in this set but has no pathway-specific factors yet.
 * Scale: 0–100 (clamped). >=70 with net positive factors → High confidence.
 */

import type { PatientProfile, TrialId } from '../types/evidence'

export interface ScoringRule {
  /** null = applies to all trials */
  trialId: TrialId | null
  condition: (p: PatientProfile) => boolean
  delta: number
  factor: 'positive' | 'negative'
  label: string | ((p: PatientProfile) => string)
}

export const SCORE_BASELINE = 42

export const SCORING_RULES: ScoringRule[] = [
  // ── Global rules (apply to all scored trials) ─────────────────────────
  {
    trialId: null,
    condition: (p) => p.nodeStatus === 'N1',
    delta: 15,
    factor: 'positive',
    label: 'Node-positive disease strongly matches systemic intensification trial populations.',
  },
  {
    trialId: null,
    condition: (p) => p.psa >= 40,
    delta: 10,
    factor: 'positive',
    label: 'PSA ≥40 ng/mL is a major high-risk feature.',
  },
  {
    trialId: null,
    condition: (p) => p.psa >= 20 && p.psa < 40,
    delta: 5,
    factor: 'positive',
    label: 'PSA ≥20 ng/mL supports high-risk classification.',
  },
  {
    trialId: null,
    condition: (p) => ['T3a', 'T3b', 'T4'].includes(p.clinicalStage),
    delta: 10,
    factor: 'positive',
    label: (p) => `${p.clinicalStage} stage matches locally advanced eligibility patterns.`,
  },
  {
    trialId: null,
    condition: (p) => p.gleasonGradeGroup >= 4,
    delta: 10,
    factor: 'positive',
    label: (p) => `Grade Group ${p.gleasonGradeGroup} matches high-grade inclusion features.`,
  },
  {
    trialId: null,
    condition: (p) =>
      [
        p.psa >= 40,
        ['T3a', 'T3b', 'T4'].includes(p.clinicalStage),
        p.gleasonGradeGroup >= 4,
        p.nodeStatus === 'N1',
      ].filter(Boolean).length >= 3,
    delta: 8,
    factor: 'positive',
    label: 'Multiple high-risk features increase applicability of intensification evidence.',
  },
  {
    trialId: null,
    condition: (p) => p.psmaPetAvailable,
    delta: 3,
    factor: 'positive',
    label: 'PSMA PET availability improves modern staging confidence.',
  },
  {
    trialId: null,
    condition: (p) => !p.psmaPetAvailable,
    delta: 4,
    factor: 'negative',
    label: 'No PSMA PET: confidence in modern M0 classification is reduced.',
  },

  // ── STAMPEDE M0 ────────────────────────────────────────────────────────
  {
    trialId: 'stampedem0',
    condition: (p) => p.radiotherapyCandidate,
    delta: 18,
    factor: 'positive',
    label: 'Radiotherapy candidate: STAMPEDE M0 is built around RT plus long-term ADT.',
  },
  {
    trialId: 'stampedem0',
    condition: (p) => !p.radiotherapyCandidate,
    delta: 30,
    factor: 'negative',
    label: 'Not a radiotherapy candidate, which conflicts with the STAMPEDE pathway.',
  },
  {
    trialId: 'stampedem0',
    condition: (p) => p.patientPreference === 'Radiotherapy',
    delta: 8,
    factor: 'positive',
    label: 'Patient preference aligns with the RT pathway.',
  },
  {
    trialId: 'stampedem0',
    condition: (p) => p.patientPreference === 'Surgery',
    delta: 10,
    factor: 'negative',
    label: 'Patient preference favors surgery rather than definitive RT.',
  },
  {
    trialId: 'stampedem0',
    condition: (p) => p.comorbidityBurden === 'High',
    delta: 12,
    factor: 'negative',
    label: 'High comorbidity raises concern for 2 years of abiraterone/prednisolone toxicity monitoring.',
  },
  {
    trialId: 'stampedem0',
    condition: (p) => p.nodeStatus === 'Nx',
    delta: 7,
    factor: 'negative',
    label: 'Unknown nodal status weakens match to the reported risk strata.',
  },

  // ── PROTEUS ────────────────────────────────────────────────────────────
  {
    trialId: 'proteus',
    condition: (p) => p.surgeryCandidate,
    delta: 20,
    factor: 'positive',
    label: 'Surgery candidate: PROTEUS maps to radical prostatectomy with perioperative systemic therapy.',
  },
  {
    trialId: 'proteus',
    condition: (p) => !p.surgeryCandidate,
    delta: 32,
    factor: 'negative',
    label: 'Not a surgery candidate, which conflicts with the PROTEUS pathway.',
  },
  {
    trialId: 'proteus',
    condition: (p) => p.patientPreference === 'Surgery',
    delta: 10,
    factor: 'positive',
    label: 'Patient preference aligns with prostatectomy.',
  },
  {
    trialId: 'proteus',
    condition: (p) => p.patientPreference === 'Radiotherapy',
    delta: 12,
    factor: 'negative',
    label: 'Patient preference favors definitive RT rather than surgery.',
  },
  {
    trialId: 'proteus',
    condition: (p) => p.age > 75,
    delta: 8,
    factor: 'negative',
    label: 'Age >75 may increase perioperative complexity.',
  },
  {
    trialId: 'proteus',
    condition: (p) => p.comorbidityBurden === 'High',
    delta: 14,
    factor: 'negative',
    label: 'High comorbidity raises perioperative and systemic therapy risk.',
  },

  // ── ENZARAD ────────────────────────────────────────────────────────────
  {
    trialId: 'enzarad',
    condition: (p) => p.radiotherapyCandidate,
    delta: 14,
    factor: 'positive',
    label: 'Radiotherapy candidate: ENZARAD used an RT plus ADT backbone.',
  },
  {
    trialId: 'enzarad',
    condition: (p) => !p.radiotherapyCandidate,
    delta: 28,
    factor: 'negative',
    label: 'Not a radiotherapy candidate, which conflicts with the ENZARAD pathway.',
  },
  {
    trialId: 'enzarad',
    condition: (p) => p.patientPreference === 'Radiotherapy',
    delta: 6,
    factor: 'positive',
    label: 'Patient preference aligns with the ENZARAD pathway.',
  },
  {
    trialId: 'enzarad',
    condition: (p) => p.nodeStatus === 'N1',
    delta: 5,
    factor: 'positive',
    label: 'cN1 disease may be a more relevant subgroup than the overall ENZARAD population.',
  },
  {
    trialId: 'enzarad',
    condition: () => true,
    delta: 8,
    factor: 'negative',
    label: 'Overall ENZARAD MFS/OS results were not clearly positive in the full population.',
  },
  {
    trialId: 'enzarad',
    condition: (p) => p.comorbidityBurden === 'High',
    delta: 8,
    factor: 'negative',
    label: 'Enzalutamide tolerability may be less attractive in high comorbidity.',
  },

  // ── Pending trials ─────────────────────────────────────────────────────
  {
    trialId: 'atlas',
    condition: () => true,
    delta: 22,
    factor: 'negative',
    label: 'Results are pending — trial applicability is informational, not decision-grade.',
  },
  {
    trialId: 'atlas',
    condition: (p) => p.radiotherapyCandidate,
    delta: 8,
    factor: 'positive',
    label: 'Patient can follow the radiotherapy backbone under study.',
  },
  {
    trialId: 'dasl',
    condition: () => true,
    delta: 22,
    factor: 'negative',
    label: 'Results are pending — trial applicability is informational, not decision-grade.',
  },
  {
    trialId: 'dasl',
    condition: (p) => p.radiotherapyCandidate,
    delta: 8,
    factor: 'positive',
    label: 'Patient can follow the radiotherapy backbone under study.',
  },
  {
    trialId: 'spcg15',
    condition: () => true,
    delta: 22,
    factor: 'negative',
    label: 'Results are pending — trial applicability is informational, not decision-grade.',
  },
  {
    trialId: 'spcg15',
    condition: (p) => p.surgeryCandidate && p.radiotherapyCandidate,
    delta: 12,
    factor: 'positive',
    label: 'Candidate for both modalities — matches the SPCG-15 direct comparison question.',
  },
]
