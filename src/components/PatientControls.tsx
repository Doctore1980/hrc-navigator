import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import type { PatientProfile } from '../types/evidence'
import { deriveRiskLabel, deriveRiskColor, highRiskFactorCount } from '../lib/compatibility'
import { Card, Badge, Button } from './ui'
import { useEvidenceStore } from '../store/useEvidenceStore'

type Option<T extends string | number | boolean> = { value: T; label: string }

function Field({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function SelectField<T extends string | number | boolean>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}) {
  return (
    <Field id={id} label={label}>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => {
          const next = options.find((o) => String(o.value) === e.target.value)
          if (next) onChange(next.value)
        }}
        className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/30"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
  warn,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  hint?: string
  onChange: (v: number) => void
  warn?: string | null
}) {
  return (
    <Field id={id} label={unit ? `${label} (${unit})` : label} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          aria-describedby={warn ? `${id}-warn` : undefined}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
          }}
          className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/30"
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {unit}
          </span>
        ) : null}
      </div>
      {warn ? (
        <p id={`${id}-warn`} role="alert" className="mt-1 text-xs text-amber-400">
          {warn}
        </p>
      ) : null}
    </Field>
  )
}

export function PatientControls({
  patient,
  updatePatient,
}: {
  patient: PatientProfile
  updatePatient: <K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) => void
}) {
  const resetPatient = useEvidenceStore((s) => s.resetPatient)
  const riskLabel = deriveRiskLabel(patient)
  const riskColor = deriveRiskColor(patient)
  const rfCount = highRiskFactorCount(patient)

  const psaWarn =
    patient.psa <= 0
      ? 'PSA ≤0 produce puntuación no válida'
      : patient.psa < 2
        ? 'PSA muy bajo para este perfil de riesgo'
        : null

  return (
    <Card className="p-4">
      {/* Risk summary banner */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Badge tone={riskColor === 'red' ? 'red' : riskColor === 'amber' ? 'amber' : 'blue'}>
            {rfCount} risk factor{rfCount !== 1 ? 's' : ''}
          </Badge>
          <span className="text-sm text-slate-300">{riskLabel}</span>
        </div>
        <Button
          onClick={resetPatient}
          title="Reset to default patient profile"
          aria-label="Reset patient profile to default values"
          className="h-7 gap-1.5 px-2 text-xs text-slate-400"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Reset
        </Button>
      </div>

      <fieldset>
        <legend className="sr-only">Patient clinical profile</legend>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <NumberField
            id="patient-age"
            label="Age"
            value={patient.age}
            min={40}
            max={95}
            unit="years"
            onChange={(v) => updatePatient('age', v as PatientProfile['age'])}
            warn={patient.age > 85 ? 'Performance status should be carefully assessed at this age' : null}
          />
          <NumberField
            id="patient-psa"
            label="PSA"
            value={patient.psa}
            min={0.1}
            max={10000}
            step={0.1}
            unit="ng/mL"
            onChange={(v) => updatePatient('psa', v)}
            warn={psaWarn}
          />
          <SelectField
            id="patient-stage"
            label="Clinical T stage"
            value={patient.clinicalStage}
            onChange={(v) => updatePatient('clinicalStage', v)}
            options={['T1-2', 'T3a', 'T3b', 'T4'].map((v) => ({ value: v as PatientProfile['clinicalStage'], label: v }))}
          />
          <SelectField
            id="patient-nodes"
            label="Node status"
            value={patient.nodeStatus}
            onChange={(v) => updatePatient('nodeStatus', v)}
            options={[
              { value: 'N0' as const, label: 'N0 – node-negative' },
              { value: 'N1' as const, label: 'N1 – node-positive' },
              { value: 'Nx' as const, label: 'Nx – unknown' },
            ]}
          />
          <SelectField
            id="patient-gg"
            label="Gleason grade group"
            value={patient.gleasonGradeGroup}
            onChange={(v) => updatePatient('gleasonGradeGroup', v)}
            options={[1, 2, 3, 4, 5].map((v) => ({
              value: v as PatientProfile['gleasonGradeGroup'],
              label: `GG${v} – ${v === 1 ? 'Gleason 6' : v === 2 ? 'Gleason 3+4' : v === 3 ? 'Gleason 4+3' : v === 4 ? 'Gleason 8' : 'Gleason 9–10'}`,
            }))}
          />
          <SelectField
            id="patient-psma"
            label="PSMA PET"
            value={patient.psmaPetAvailable}
            onChange={(v) => updatePatient('psmaPetAvailable', v)}
            options={[
              { value: true, label: 'Available' },
              { value: false, label: 'Not available' },
            ]}
          />
          <SelectField
            id="patient-rt"
            label="Candidate for RT"
            value={patient.radiotherapyCandidate}
            onChange={(v) => updatePatient('radiotherapyCandidate', v)}
            options={[
              { value: true, label: 'Yes – RT eligible' },
              { value: false, label: 'No – RT ineligible' },
            ]}
          />
          <SelectField
            id="patient-surg"
            label="Candidate for surgery"
            value={patient.surgeryCandidate}
            onChange={(v) => updatePatient('surgeryCandidate', v)}
            options={[
              { value: true, label: 'Yes – surgery eligible' },
              { value: false, label: 'No – surgery ineligible' },
            ]}
          />
          <SelectField
            id="patient-comorbidity"
            label="Comorbidity burden"
            value={patient.comorbidityBurden}
            onChange={(v) => updatePatient('comorbidityBurden', v)}
            options={[
              { value: 'Low' as const, label: 'Low – fit patient' },
              { value: 'Moderate' as const, label: 'Moderate – some limitations' },
              { value: 'High' as const, label: 'High – significant comorbidity' },
            ]}
          />
          <SelectField
            id="patient-preference"
            label="Patient preference"
            value={patient.patientPreference}
            onChange={(v) => updatePatient('patientPreference', v)}
            options={[
              { value: 'Radiotherapy' as const, label: 'Radiotherapy' },
              { value: 'Surgery' as const, label: 'Surgery' },
              { value: 'No preference' as const, label: 'No preference' },
            ]}
          />
        </div>
      </fieldset>
    </Card>
  )
}
