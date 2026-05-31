# High-Risk Prostate Cancer Evidence Navigator 2026

Production-oriented React dashboard for educational review of high-risk localized prostate cancer trials:

- STAMPEDE M0
- PROTEUS
- ENZARAD
- ATLAS
- DASL-HiCaP
- SPCG-15

The application is decision-support and education only. It does not provide medical advice.

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS v4
- Zustand state
- Recharts and D3 scale utilities
- TanStack Table
- Lucide Icons
- Framer Motion
- html2canvas + jsPDF for export

## Features

- Dashboard with MFS, OS, toxicity and absolute benefit charts
- Trial Explorer with expandable evidence cards, endpoint summaries and limitations
- Patient Navigator with transparent rule-based scoring for STAMPEDE, PROTEUS and ENZARAD
- Dynamic Treatment Pathway workflow
- Sortable/filterable Evidence Matrix
- Future Evidence tracker for ATLAS, DASL-HiCaP and SPCG-15
- PDF, PNG and print-friendly export
- Vercel-ready configuration

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

This repository includes `vercel.json`. On Vercel, use:

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## Data Notes

The initial dataset is static mock evidence curated from the supplied project specification and research report. The patient compatibility engine is intentionally rule-based and transparent; it is not AI, machine learning or a medical recommendation engine.

## Screenshots

Sample screenshots are generated from the running app during verification and saved under `src/assets/screenshots/` when browser automation is available.
