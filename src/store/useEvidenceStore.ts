import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultPatient } from '../lib/compatibility'
import type { PatientProfile, TrialId, TrialPathway } from '../types/evidence'

export type PageId = 'dashboard' | 'explorer' | 'patient' | 'pathway' | 'matrix' | 'future'

export const VALID_PAGES: PageId[] = ['dashboard', 'explorer', 'patient', 'pathway', 'matrix', 'future']

function getInitialPage(): PageId {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.slice(1) as PageId
    if (VALID_PAGES.includes(hash)) return hash
  }
  return 'dashboard'
}

interface EvidenceState {
  page: PageId
  pathwayFilter: TrialPathway | 'all'
  selectedTrialId: TrialId
  patient: PatientProfile
  setPage: (page: PageId) => void
  setPathwayFilter: (filter: TrialPathway | 'all') => void
  setSelectedTrialId: (id: TrialId) => void
  updatePatient: <K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) => void
  resetPatient: () => void
}

export const useEvidenceStore = create<EvidenceState>()(
  persist(
    (set) => ({
      page: getInitialPage(),
      pathwayFilter: 'all',
      selectedTrialId: 'stampedem0',
      patient: defaultPatient,
      setPage: (page) => {
        if (typeof window !== 'undefined') window.location.hash = page
        set({ page })
      },
      setPathwayFilter: (pathwayFilter) => set({ pathwayFilter }),
      setSelectedTrialId: (selectedTrialId) => set({ selectedTrialId }),
      updatePatient: (key, value) =>
        set((state) => ({
          patient: { ...state.patient, [key]: value },
        })),
      resetPatient: () => set({ patient: defaultPatient }),
    }),
    {
      name: 'hrc-navigator-v1',
      // Only persist patient profile and page, not transient UI state
      partialize: (state) => ({ patient: state.patient, page: state.page }),
    },
  ),
)
