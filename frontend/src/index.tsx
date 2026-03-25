import type { ReactElement } from 'react'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { SceneList } from '@/components/editor/SceneList'
import { useProjectStore } from '@/lib/store/projectStore'
import { useUIStore } from '@/lib/store/uiStore'
import { useScenes, useSaveSceneContent } from '@/hooks/useScene'
import type { Scene } from '@/types/database'

/* ── No-project state ───────────────────────────────────────────── */

function NoProjectOpen(): ReactElement {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center px-8">
      <BookOpen
        size={52}
        strokeWidth={0.75}
        className="text-nf-accent opacity-20"
      />
      <div className="space-y-1">
        <p className="font-headline italic text-2xl text-nf-text-secondary">
          No story is open.
        </p>
        <p className="font-label text-sm text-nf-text-muted max-w-xs">
          Go to the Library, pick a manuscript, and it will open here.
        </p>
      </div>
      <Button
        onClick={() => { void navigate('/') }}
        variant="outline"
        className="font-label border-nf-border text-nf-text-secondary hover:text-nf-text-primary"
      >
        Go to Library
      </Button>
    </div>
  )
}

/* ── No-scene selected state ────────────────────────────────────── */

function NoSceneSelected(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
      <p className="font-headline italic text-xl text-nf-text-muted">
        Select a scene to start writing.
      </p>
      <p className="font-label text-sm text-nf-text-disabled">
        Or press + in the scene list to create one.
      </p>
    </div>
  )
}

/* ── WritingPage ────────────────────────────────────────────────── */

export function WritingPage(): ReactElement {
  const currentProject = useProjectStore((s) => s.currentProject)
  const setSyncStatus = useUIStore((s) => s.setSyncStatus)
  const setTokenCount = useUIStore((s) => s.setTokenCount)

  const [activeScene, setActiveScene] = useState<Scene | null>(null)

  const { data: scenes = [], isLoading } = useScenes(
    currentProject?.id ?? null,
  )
  const saveContent = useSaveSceneContent()

  /* ── Autosave callback ──────────────────────────────────────── */

  /*
   * useCallback keeps the reference stable across renders.
   * TipTapEditor stores this in a ref internally, so stability
   * here is belt-and-suspenders — but it costs nothing.
   */
  const handleSave = useCallback(
    (content: string, wordCount: number) => {
      if (!activeScene) return

      setSyncStatus('syncing')

      saveContent.mutate(
        { id: activeScene.id, content, word_count: wordCount },
        {
          onSuccess: () => {
            setSyncStatus('synced', new Date())
            /*
             * Keep the local activeScene word count in sync so the
             * scene list footer total updates without a refetch.
             */
            setActiveScene((prev) =>
              prev ? { ...prev, word_count: wordCount } : prev,
            )
          },
          onError: () => { setSyncStatus('error') },
        },
      )

      /*
       * Update the token counter with a rough character-based proxy.
       * Real token counting comes in Block 8 (chat integration).
       */
      setTokenCount(Math.round(wordCount * 1.3))
    },
    [activeScene, saveContent, setSyncStatus, setTokenCount],
  )

  /* ── Render: no project open ────────────────────────────────── */

  if (!currentProject) return <NoProjectOpen />

  /* ── Render: project open ───────────────────────────────────── */

  return (
    <div className="flex h-full flex-col">
      {/* Scene title header */}
      <div className="flex items-center gap-3 border-b border-nf-border-subtle px-8 py-4">
        <h1 className="font-headline italic text-2xl text-nf-text-primary">
          {currentProject.title}
        </h1>

        {activeScene && (
          <>
            <span className="text-nf-text-disabled">·</span>
            <span className="font-headline italic text-xl text-nf-text-muted">
              {activeScene.title}
            </span>
          </>
        )}
      </div>

      {/* Main writing area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scene list panel */}
        <SceneList
          scenes={scenes}
          activeSceneId={activeScene?.id ?? null}
          projectId={currentProject.id}
          isLoading={isLoading}
          onSelectScene={(scene) => { setActiveScene(scene) }}
        />

        {/* Editor area */}
        {activeScene ? (
          <TipTapEditor
            key={activeScene.id}
            initialContent={activeScene.content ?? ''}
            onSave={handleSave}
            placeholder={`Begin "${activeScene.title}"…`}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <NoSceneSelected />
          </div>
        )}
      </div>
    </div>
  )
}