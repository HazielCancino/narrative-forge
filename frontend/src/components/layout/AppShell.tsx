import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'

/*
 * AppShell wraps every authenticated page.
 *
 * Layout (flexbox column):
 *   ┌─────────────────────────────────┐  h-16  TopNav
 *   ├──────────┬──────────────────────┤
 *   │ Sidebar  │  <Outlet />          │  flex-1
 *   │  w-64    │  (page content)      │
 *   ├──────────┴──────────────────────┤  h-8   StatusBar
 *   └─────────────────────────────────┘
 *
 * The <Outlet /> renders whichever child route is active.
 * react-router v7 nested route pattern — no {children} prop.
 */
export function AppShell(): ReactElement {
  return (
    <div className="flex h-screen flex-col bg-nf-bg text-nf-text-primary overflow-hidden">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main
          id="main-content"
          className="flex-1 overflow-auto bg-nf-bg"
          /*
           * This container is the scroll root for page content.
           * Individual pages control their own padding/layout.
           */
        >
          <Outlet />
        </main>
      </div>

      <StatusBar />
    </div>
  )
}
