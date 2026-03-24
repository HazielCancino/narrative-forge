import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LibraryPage } from '@/pages/Library'
import { WritingPage } from '@/pages/Writing'
import { WorldBuilderPage } from '@/pages/WorldBuilder'
import { SettingsPage } from '@/pages/Settings'

/*
 * Route hierarchy:
 *
 *   /login           → Login (public)
 *   /register        → Register (public)
 *   *                → ProtectedRoute (redirects to /login if no session)
 *     AppShell       → TopNav + Sidebar + StatusBar wrapper
 *       /            → Library (project list — Block 6)
 *       /writing     → Writing editor (Block 7)
 *       /world-builder → World Builder (Block 6+)
 *       /settings    → Architect's Chamber (Phase 2+)
 *
 * ProtectedRoute and AppShell are "layout routes" — they render
 * <Outlet /> and have no path of their own. This keeps auth and
 * shell logic separate from page logic.
 */
export function Router(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected routes ──────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index             element={<LibraryPage />} />
            <Route path="writing"    element={<WritingPage />} />
            <Route path="world-builder/*" element={<WorldBuilderPage />} />
            <Route path="settings"   element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
