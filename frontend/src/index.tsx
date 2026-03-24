import type { ReactElement } from 'react'
import { LayoutGrid } from 'lucide-react'

export function LibraryPage(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
      <LayoutGrid
        size={40}
        className="text-nf-text-disabled"
        strokeWidth={1}
      />
      <div className="text-center">
        <h1 className="font-headline italic text-3xl text-nf-text-secondary mb-2">
          Library
        </h1>
        <p className="font-label text-sm text-nf-text-muted">
          Projects CRUD — Block 6
        </p>
      </div>
    </div>
  )
}
