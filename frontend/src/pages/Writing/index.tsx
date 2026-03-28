import type { ReactElement } from 'react'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import type { JSONContent } from '@tiptap/react'
import { extractPlainText } from '@/lib/utils/extractText'
import { SceneList } from '@/components/editor/SceneList'
import { ManuscriptAI } from '@/components/chat/ManuscriptAI'
import { useProjectStore } from '@/lib/store/projectStore'
import { useUIStore } from '@/lib/store/uiStore'
import { useScenes, useSaveSceneContent } from '@/hooks/useScene'
import { cn } from '@/lib/utils'
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

/* ── No-scene selected ──────────────────────────────────────────── */

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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null)

  // Initialize editorContent from the active scene whenever the scene changes.
  // This ensures sceneText is populated immediately on scene load, not only
  // after the user types something and autosave fires.
  useEffect(() => {
    if (!activeScene?.content) {
      setEditorContent(null)
      return
    }
    try {
      setEditorContent(JSON.parse(activeScene.content) as JSONContent)
    } catch {
      // Content is plain text or markdown — sceneText will update
      // once the user types and autosave fires for the first time.
      setEditorContent(null)
    }
  }, [activeScene?.id])  // intentionally only activeScene.id, not the full object
  const sceneText = useMemo(
    () => extractPlainText(editorContent),
    [editorContent],
  )

  const { data: scenes = [], isLoading } = useScenes(
    currentProject?.id ?? null,
  )
  const saveContent = useSaveSceneContent()

  /* ── Autosave callback ──────────────────────────────────────── */

  const handleSave = useCallback(
    (content: string, wordCount: number) => {
      if (!activeScene) return
      setSyncStatus('syncing')
      saveContent.mutate(
        { id: activeScene.id, content, word_count: wordCount },
        {
          onSuccess: () => {
            setSyncStatus('synced', new Date())
            setActiveScene((prev) =>
              prev ? { ...prev, word_count: wordCount } : prev,
            )
          },
          onError: () => { setSyncStatus('error') },
        },
      )
      setTokenCount(Math.round(wordCount * 1.3))

      // Parse the saved JSON string back into JSONContent so sceneText
      // stays in sync with whatever the autosave just persisted.
      try {
        setEditorContent(JSON.parse(content) as JSONContent)
      } catch {
        // If content is plain text or unparseable, leave sceneText as-is
      }
    },
    [activeScene, saveContent, setSyncStatus, setTokenCount],
  )

  /* ── No project ─────────────────────────────────────────────── */

  if (!currentProject) return <NoProjectOpen />

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="flex h-full flex-col">

      {/* ── Toolbar / header ───────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-nf-border-subtle px-8 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-headline italic text-xl text-nf-text-primary truncate">
            {currentProject.title}
          </h1>
          {activeScene !== null && (
            <>
              <span className="shrink-0 text-nf-text-disabled">·</span>
              <span className="font-headline italic text-lg text-nf-text-muted truncate">
                {activeScene.title}
              </span>
            </>
          )}
        </div>

        {/* Chat toggle */}
        <button
          type="button"
          onClick={() => { setIsChatOpen((prev) => !prev) }}
          aria-pressed={isChatOpen}
          aria-label={isChatOpen ? 'Close AI panel' : 'Open AI panel'}
          title="Manuscript AI (Alt+A)"
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5',
            'font-label text-[10px] uppercase tracking-widest',
            'transition-all duration-200',
            isChatOpen
              ? 'bg-nf-secondary/20 text-nf-secondary'
              : 'text-nf-text-muted hover:bg-nf-surface-bright hover:text-nf-text-secondary',
          )}
        >
          <Bot size={14} />
          <span className="hidden sm:inline">AI</span>
        </button>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Scene list */}
        <SceneList
          scenes={scenes}
          activeSceneId={activeScene?.id ?? null}
          projectId={currentProject.id}
          isLoading={isLoading}
          onSelectScene={(scene) => { setActiveScene(scene) }}
        />

        {/* Editor */}
        {activeScene !== null ? (
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

        {/* Chat panel */}
        {isChatOpen && (
          <ManuscriptAI
            projectTitle={currentProject.title}
            projectGenre={currentProject.genre ?? ''}
            sceneTitle={activeScene?.title ?? ''}
            sceneContent={sceneText}
          />
        )}
      </div>
    </div>
  )
}