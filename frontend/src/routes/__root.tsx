import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { MarketingHeader, MarketingFooter } from '@/components/landing'
import { AppHeader } from '@/components/shared/app-header'

const MARKETING_PREFIXES = ['/solutions', '/showcase']
const AUTH_PAGES = ['/login', '/register']

function isMarketingPath(pathname: string) {
  return pathname === '/' || MARKETING_PREFIXES.some((p) => pathname.startsWith(p))
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.includes(pathname)
}

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const location = useRouterState({ select: (s) => s.location })
  const isConsole = location.pathname.startsWith('/console')
  const isMarketing = isMarketingPath(location.pathname)
  const isAuth = isAuthPage(location.pathname)

  if (isConsole) {
    return <Outlet />
  }

  if (isMarketing) {
    return (
      <div className="min-h-screen bg-paper text-ink-2 antialiased">
        <MarketingHeader />
        <main>
          <Outlet />
        </main>
        <MarketingFooter />
      </div>
    )
  }

  if (isAuth) {
    return (
      <div className="min-h-screen bg-paper text-ink-2 antialiased" data-theme="light">
        <MarketingHeader />
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink-2 antialiased" data-theme="light">
      <AppHeader />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}