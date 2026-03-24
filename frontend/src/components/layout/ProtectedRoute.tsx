import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/lib/store/sessionStore'

/*
 * Uses <Outlet /> instead of {children} so react-router v7 nested
 * routes work correctly. The router wraps AppShell inside this route,
 * so all authenticated pages go through ProtectedRoute → AppShell.
 */
export function ProtectedRoute(): ReactElement {
  const { session, isLoading } = useSessionStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nf-bg">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-nf-border border-t-nf-accent"
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
