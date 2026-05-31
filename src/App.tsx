import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  Dna,
  Filter,
  FlaskConical,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import {
  AbsoluteBenefitChart,
  GroupedOutcomeChart,
  RecommendationRadar,
  ToxicityChart,
} from './components/Charts'
import { EvidenceTable } from './components/EvidenceTable'
import { AppShell } from './components/AppShell'
import { PatientControls } from './components/PatientControls'
import { PathwayGraph } from './components/PathwayGraph'
import { Badge, Button, Card, MetricCard, SectionHeader, ScoreMeter } from './components/ui'
import { absoluteBenefit, mfsComparison, osComparison, toxicityComparison } from './data/chartData'
import { trials } from './data/trials'
import { deriveRiskLabel, scoreAllTrials } from './lib/compatibility'
import { formatPercent } from './lib/utils'
import { useEvidenceStore } from './store/useEvidenceStore'
import type { Trial } from './types/evidence'

function endpoint(trial: Trial, type: string) {
  return trial.endpoints.find((e) => e.type === type)
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

// ── InfoBlock / InfoList helpers ──────────────────────────────────────────────

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-slate-950/30 p-3">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{text}</p>
    </div>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/8 bg-slate-950/30 p-3">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-slate-300" role="list">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const filter = useEvidenceStore((s) => s.pathwayFilter)
  const setFilter = useEvidenceStore((s) => s.setPathwayFilter)
  const visibleTrials = trials.filter((t) => filter === 'all' || t.pathway === filter)
  const stampede = trials.find((t) => t.id === 'stampedem0')!
  const proteus = trials.find((t) => t.id === 'proteus')!

  return (
    <Page>
      <SectionHeader eyebrow="Dashboard" title="Outcome signal at a glance">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter by treatment pathway"
        >
          <Filter size={14} className="text-slate-500" aria-hidden="true" />
          {(['all', 'radiotherapy', 'surgery'] as const).map((item) => (
            <Button
              key={item}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={filter === item ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : ''}
            >
              {item === 'all' ? 'All' : item === 'radiotherapy' ? 'RT' : 'Surgery'}
            </Button>
          ))}
        </div>
      </SectionHeader>

      {/* Key metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="STAMPEDE MFS HR"
          value="0.53"
          sublabel={`${formatPercent(endpoint(stampede, 'MFS')?.experimental)} vs ${formatPercent(endpoint(stampede, 'MFS')?.comparator)} at 6y`}
          tone="green"
        />
        <MetricCard
          label="STAMPEDE OS HR"
          value="0.60"
          sublabel={`${formatPercent(endpoint(stampede, 'OS')?.experimental)} vs ${formatPercent(endpoint(stampede, 'OS')?.comparator)} at 6y`}
          tone="blue"
        />
        <MetricCard
          label="PROTEUS MFS HR"
          value="0.80"
          sublabel={`${formatPercent(endpoint(proteus, 'MFS')?.experimental)} vs ${formatPercent(endpoint(proteus, 'MFS')?.comparator)}`}
          tone="amber"
        />
        <MetricCard
          label="PROTEUS pCR/MRD OR"
          value="10.17"
          sublabel={`${formatPercent(endpoint(proteus, 'pCR/MRD')?.experimental)} vs ${formatPercent(endpoint(proteus, 'pCR/MRD')?.comparator)}`}
          tone="green"
        />
      </div>

      {/* Charts 2×2 */}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <GroupedOutcomeChart
            title="MFS comparison (%)"
            ariaLabel="Metastasis-free survival comparison between intensified and control arms"
            data={mfsComparison.filter((row) =>
              visibleTrials.some((t) => t.shortName === row.trial),
            )}
          />
        </Card>
        <Card className="p-4">
          <GroupedOutcomeChart
            title="OS comparison (%)"
            ariaLabel="Overall survival comparison between intensified and control arms"
            data={osComparison.filter((row) =>
              visibleTrials.some((t) => t.shortName === row.trial),
            )}
          />
        </Card>
        <Card className="p-4">
          <ToxicityChart data={toxicityComparison} />
        </Card>
        <Card className="p-4">
          <AbsoluteBenefitChart data={absoluteBenefit} />
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="mt-4 flex items-start gap-3 border-amber-300/20 bg-amber-300/8 p-4">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-amber-100/85" role="note">
          This educational tool summarises trial applicability and does not recommend treatment for
          an individual patient. Final decisions require clinical evaluation, guideline context,
          toxicity review, and MDT discussion.
        </p>
      </Card>
    </Page>
  )
}

// ── Trial Explorer ────────────────────────────────────────────────────────────

function TrialExplorer() {
  const [open, setOpen] = useState<string>('stampedem0')

  return (
    <Page>
      <SectionHeader eyebrow="Trial Explorer" title="Structured evidence cards" />
      <div className="grid gap-3" role="list" aria-label="Clinical trials">
        {trials.map((trial) => {
          const expanded = open === trial.id
          const evidenceTone =
            trial.evidenceLevel === 'High'
              ? 'green'
              : trial.evidenceLevel === 'Moderate'
                ? 'blue'
                : 'amber'
          const pathwayTone = trial.pathway === 'surgery' ? 'amber' : 'blue'
          const pathwayLabel =
            trial.pathway === 'radiotherapy'
              ? 'RT pathway'
              : trial.pathway === 'surgery'
                ? 'Surgery pathway'
                : 'Modality comparison'

          return (
            <Card key={trial.id} className="overflow-hidden" role="listitem">
              <button
                onClick={() => setOpen(expanded ? '' : trial.id)}
                aria-expanded={expanded}
                aria-controls={`trial-${trial.id}-detail`}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white sm:text-lg">{trial.shortName}</h3>
                    <Badge tone={evidenceTone}>{trial.evidenceLevel}</Badge>
                    <Badge>{trial.phase}</Badge>
                    <Badge tone={pathwayTone}>{pathwayLabel}</Badge>
                    {trial.maturity === 'Pending' ? (
                      <Badge tone="amber">Pending</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-400 line-clamp-2">{trial.population}</p>
                </div>
                <ChevronDown
                  className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180 text-cyan-200' : 'text-slate-500'}`}
                  size={18}
                  aria-hidden="true"
                />
              </button>

              {expanded ? (
                <div
                  id={`trial-${trial.id}-detail`}
                  className="border-t border-white/8 p-4"
                >
                  {/* Timeline */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(['start', 'report', 'expected'] as const).map((key) => {
                      const value = trial.years[key]
                      return value ? (
                        <div
                          key={key}
                          className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                        >
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            {key}
                          </div>
                          <div className="mt-0.5 text-lg font-bold text-cyan-100">{value}</div>
                        </div>
                      ) : null
                    })}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoBlock title="Design" text={trial.design} />
                    <InfoBlock title="Intervention" text={trial.intervention} />
                    <InfoBlock title="Comparator" text={trial.comparator} />
                    <InfoBlock
                      title="Key results"
                      text={trial.outcomes.map((o) => `${o.endpoint}: ${o.value}`).join(' · ')}
                    />
                    <InfoBlock title="Toxicity" text={trial.toxicity} />
                    <InfoBlock
                      title="Clinical interpretation"
                      text={trial.clinicalInterpretation}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <InfoList title="Inclusion criteria" items={trial.inclusionCriteria} />
                    <InfoList title="Limitations" items={trial.limitations} />
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </Page>
  )
}

// ── Patient Navigator ─────────────────────────────────────────────────────────

function PatientNavigator() {
  const patient = useEvidenceStore((s) => s.patient)
  const updatePatient = useEvidenceStore((s) => s.updatePatient)
  const recommendations = useMemo(() => scoreAllTrials(patient), [patient])

  return (
    <Page>
      <SectionHeader
        eyebrow="Patient Navigator"
        title="Transparent compatibility engine"
      />
      <PatientControls patient={patient} updatePatient={updatePatient} />

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {/* Score bars */}
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Dna size={15} className="text-cyan-300" aria-hidden="true" />
            Compatibility scores
          </div>
          <RecommendationRadar recommendations={recommendations} />
        </Card>

        {/* Explanation cards */}
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles size={15} className="text-cyan-300" aria-hidden="true" />
            Score breakdown
          </div>
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const trial = trials.find((t) => t.id === rec.trialId)!
              return (
                <div key={rec.trialId} className="rounded-lg border border-white/8 bg-slate-950/35 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-white">{trial.shortName}</span>
                    <ScoreMeter score={rec.score} confidence={rec.confidence} size="sm" />
                  </div>
                  <ul className="space-y-1 text-xs leading-relaxed" role="list">
                    {rec.explanation.map((line) => (
                      <li
                        key={line}
                        className={line.startsWith('+') ? 'text-emerald-300/90' : 'text-rose-300/90'}
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Positive / Limiting factors summary */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {recommendations.map((rec) => {
          const trial = trials.find((t) => t.id === rec.trialId)!
          return (
            <Card key={rec.trialId} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-slate-100">{trial.shortName}</span>
                <Badge
                  tone={
                    rec.confidence === 'High'
                      ? 'green'
                      : rec.confidence === 'Moderate'
                        ? 'blue'
                        : 'amber'
                  }
                >
                  {rec.confidence}
                </Badge>
              </div>
              {rec.positiveFactors.length > 0 ? (
                <div className="mb-2">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                    Favourable
                  </div>
                  <ul className="space-y-1 text-xs text-emerald-100/80" role="list">
                    {rec.positiveFactors.map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rec.limitingFactors.length > 0 ? (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400/70">
                    Limiting
                  </div>
                  <ul className="space-y-1 text-xs text-rose-100/80" role="list">
                    {rec.limitingFactors.map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </Page>
  )
}

// ── Treatment Pathway ─────────────────────────────────────────────────────────

function TreatmentPathway() {
  const patient = useEvidenceStore((s) => s.patient)
  const updatePatient = useEvidenceStore((s) => s.updatePatient)
  const riskLabel = deriveRiskLabel(patient)

  return (
    <Page>
      <SectionHeader eyebrow="Treatment Pathway" title="Dynamic clinical workflow" />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-4">
          <PatientControls patient={patient} updatePatient={updatePatient} />
        </div>
        <div className="space-y-4">
          <PathwayGraph patient={patient} />
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ShieldCheck size={15} className="text-cyan-300" aria-hidden="true" />
              Risk classification
            </div>
            <p className="mt-2 text-base font-medium text-cyan-100">{riskLabel}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              Changing node status, stage, PSA, treatment eligibility or patient preference updates
              the pathway and compatibility scores in real time.
            </p>
          </Card>
        </div>
      </div>
    </Page>
  )
}

// ── Evidence Matrix ───────────────────────────────────────────────────────────

function EvidenceMatrix() {
  return (
    <Page>
      <SectionHeader eyebrow="Evidence Matrix" title="Sortable cross-trial comparison" />
      <EvidenceTable />
    </Page>
  )
}

// ── Future Evidence ───────────────────────────────────────────────────────────

function FutureEvidence() {
  const future = trials.filter((t) => t.maturity === 'Pending')
  const now = new Date().getFullYear()

  return (
    <Page>
      <SectionHeader
        eyebrow="Future Evidence"
        title="Pending trials that may change practice"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {future.map((trial) => {
          const totalSpan = trial.years.expected
            ? trial.years.expected - trial.years.start
            : 10
          const elapsed = Math.min(now - trial.years.start, totalSpan)
          const progress = Math.round((elapsed / totalSpan) * 100)
          const pathwayTone = trial.pathway === 'surgery' ? 'amber' : 'blue'

          return (
            <Card key={trial.id} className="flex flex-col p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical
                    className="shrink-0 text-cyan-200"
                    size={16}
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-white">{trial.shortName}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone={pathwayTone}>
                    {trial.pathway === 'radiotherapy'
                      ? 'RT'
                      : trial.pathway === 'surgery'
                        ? 'Surgery'
                        : 'Both'}
                  </Badge>
                  <Badge tone="amber">Pending</Badge>
                </div>
              </div>

              <p className="mb-3 text-sm leading-relaxed text-slate-400">
                {trial.clinicalInterpretation}
              </p>

              {/* Progress tracker */}
              <div className="mb-3 rounded-lg border border-white/8 bg-slate-950/40 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <CalendarClock size={12} aria-hidden="true" />
                  Timeline
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Trial progress: ${progress}% of expected duration`}
                >
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                  <span>Started {trial.years.start}</span>
                  <span>Expected {trial.years.expected ?? '—'}</span>
                </div>
              </div>

              {/* Research questions */}
              <div className="mt-auto">
                <InfoList
                  title="Open questions"
                  items={trial.limitations.map((l) =>
                    l.replace('No results reported.', 'Will results support routine adoption?'),
                  )}
                />
              </div>
            </Card>
          )
        })}
      </div>
    </Page>
  )
}

// ── App root ──────────────────────────────────────────────────────────────────

function App() {
  const page = useEvidenceStore((s) => s.page)

  const pages = {
    dashboard: <Dashboard />,
    explorer: <TrialExplorer />,
    patient: <PatientNavigator />,
    pathway: <TreatmentPathway />,
    matrix: <EvidenceMatrix />,
    future: <FutureEvidence />,
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">{pages[page]}</AnimatePresence>
    </AppShell>
  )
}

export default App
