import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, FileText, Loader2, Printer } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui'

type ExportState = 'idle' | 'loading-pdf' | 'loading-png'

export function ExportActions() {
  const [state, setState] = useState<ExportState>('idle')

  async function captureCanvas(): Promise<HTMLCanvasElement> {
    const target = document.querySelector('#app-shell') as HTMLElement
    return html2canvas(target, {
      backgroundColor: '#080b12',
      scale: 1.5,
      useCORS: true,
      logging: false,
      // Exclude elements that should not appear in exports
      ignoreElements: (el) =>
        el.tagName === 'BUTTON' && el.closest('header') !== null,
    })
  }

  async function exportPdf() {
    if (state !== 'idle') return
    setState('loading-pdf')
    try {
      const canvas = await captureCanvas()
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / pageW
      const totalPages = Math.ceil(canvas.height / (pageH * ratio))

      for (let i = 0; i < totalPages; i++) {
        const sliceY = i * pageH * ratio
        const sliceH = Math.min(pageH * ratio, canvas.height - sliceY)

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceH
        const ctx = pageCanvas.getContext('2d')!
        ctx.drawImage(canvas, 0, -sliceY)

        if (i > 0) pdf.addPage()
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.88), 'JPEG', 0, 0, pageW, sliceH / ratio)
      }

      pdf.setProperties({
        title: 'High-Risk Prostate Cancer Evidence Navigator 2026',
        subject: 'Educational decision support – trial applicability summary',
        creator: 'HRC Evidence Navigator',
      })
      pdf.save('hrc-evidence-navigator.pdf')
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try the Print option instead.')
    } finally {
      setState('idle')
    }
  }

  async function exportPng() {
    if (state !== 'idle') return
    setState('loading-png')
    try {
      const canvas = await captureCanvas()
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas.toBlob failed'))),
          'image/png',
        )
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'evidence-navigator.png'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PNG export failed:', err)
      alert('PNG export failed. Please try the Print option instead.')
    } finally {
      setState('idle')
    }
  }

  const loading = state !== 'idle'

  return (
    <div className="flex flex-wrap gap-2 print:hidden" role="group" aria-label="Export options">
      <Button
        onClick={exportPdf}
        disabled={loading}
        title="Export as multi-page PDF"
        aria-label="Export as PDF"
      >
        {state === 'loading-pdf' ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <FileText size={15} aria-hidden="true" />
        )}
        PDF
      </Button>
      <Button
        onClick={exportPng}
        disabled={loading}
        title="Export current view as PNG"
        aria-label="Export as PNG image"
      >
        {state === 'loading-png' ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <Download size={15} aria-hidden="true" />
        )}
        PNG
      </Button>
      <Button
        onClick={() => window.print()}
        disabled={loading}
        title="Open browser print dialog"
        aria-label="Print"
      >
        <Printer size={15} aria-hidden="true" />
        Print
      </Button>
    </div>
  )
}
