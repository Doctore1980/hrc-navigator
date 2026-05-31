// TrialId is derived from the authoritative list in trials.ts
// Adding a new trial only requires editing trials.ts
export const TRIAL_IDS = ['stampedem0', 'proteus', 'enzarad', 'atlas', 'dasl', 'spcg15'] as const
export type TrialId = (typeof TRIAL_IDS)[number]

export type TrialPathway = 'radiotherapy' | 'surgery' | 'systemic-pending'

export type EvidenceLevel = 'High' | 'Moderate' | 'Pending' | 'Exploratory'

export type EndpointType = 'MFS' | 'OS' | 'pCR/MRD' | 'Toxicity' | 'QoL' | 'BFFS' | 'PCSS'

export interface Endpoint {
  type: EndpointType
  label: string
  timepoint?: string
  experimental?: number
  comparator?: number
  hazardRatio?: number
  oddsRatio?: number
  absoluteDelta?: number
  status?: 'reported' | 'pending' | 'immature'
  interpretation: string
}

export interface Outcome {
  endpoint: EndpointType
  value: string
  direction: 'benefit' | 'neutral' | 'harm' | 'pending'
  maturity: 'Mature' | 'Intermediate' | 'Early' | 'Pending'
}

export interface Trial {
  id: TrialId
  name: string
  shortName: string
  pathway: TrialPathway
  phase: string
  design: string
  population: string
  readonly inclusionCriteria: string[]
  intervention: string
  comparator: string
  readonly endpoints: Endpoint[]
  readonly outcomes: Outcome[]
  toxicity: string
  clinicalInterpretation: string
  readonly limitations: string[]
  evidenceLevel: EvidenceLevel
  maturity: 'Reported' | 'Interim' | 'Pending'
  years: { start: number; report?: number; expected?: number }
  reference?: string
}

export interface PatientProfile {
  age: number
  psa: number
  clinicalStage: 'T1-2' | 'T3a' | 'T3b' | 'T4'
  nodeStatus: 'N0' | 'N1' | 'Nx'
  gleasonGradeGroup: 1 | 2 | 3 | 4 | 5
  psmaPetAvailable: boolean
  radiotherapyCandidate: boolean
  surgeryCandidate: boolean
  comorbidityBurden: 'Low' | 'Moderate' | 'High'
  patientPreference: 'Radiotherapy' | 'Surgery' | 'No preference'
}

export interface Recommendation {
  trialId: TrialId
  score: number
  confidence: 'High' | 'Moderate' | 'Low'
  explanation: string[]
  positiveFactors: string[]
  limitingFactors: string[]
}
