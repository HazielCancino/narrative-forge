import type { ReactElement } from 'react'
import { Settings2 } from 'lucide-react'

export function SettingsPage(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
      <Settings2
        size={40}
        className="text-nf-text-disabled"
        strokeWidth={1}
      />
      <div className="text-center">
        <h1 className="font-headline italic text-3xl text-nf-text-secondary mb-2">
          Architect&apos;s Chamber
        </h1>
        <p className="font-label text-sm text-nf-text-muted">
          LLM connections &amp; themes — Phase 2+
        </p>
      </div>
    </div>
  )
}
