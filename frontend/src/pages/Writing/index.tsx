import type { ReactElement } from 'react'
import { PenLine } from 'lucide-react'

export function WritingPage(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
      <PenLine
        size={40}
        className="text-nf-text-disabled"
        strokeWidth={1}
      />
      <div className="text-center">
        <h1 className="font-headline italic text-3xl text-nf-text-secondary mb-2">
          Writing
        </h1>
        <p className="font-label text-sm text-nf-text-muted">
          TipTap editor — Block 7
        </p>
      </div>
    </div>
  )
}
