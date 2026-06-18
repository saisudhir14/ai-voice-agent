import { createRootRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Bot, MessageSquare, LogOut, Menu, Terminal } from 'lucide-react'
import { VoiceIcon } from '@/components/shared/voice-icon'
import { Button } from '@/components/ui/button'
import { MarketingHeader, MarketingFooter } from '@/components/landing'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

const MARKETING_PREFIXES = ['/solutions', '/showcase']

function isMarketingPath(pathname: string) {
  return pathname === '/' || MARKETING_PREFIXES.some((p) => pathname.startsWith(p))
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/conversations', label: 'Conversations', icon: MessageSquare },
] as const

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const location = useRouterState({ select: (s) => s.location })
  const isConsole = location.pathname.startsWith('/console')
  const isMarketing = isMarketingPath(location.pathname)

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

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
    setSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-nebula-deep text-slate-200">
      {/* Futuristic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-nebula-deep/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <VoiceIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl font-display font-bold tracking-tight text-white">
                VoiceAI<span className="text-slate-400">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-1 mr-4 bg-white/5 p-1 rounded-full border border-white/5">
                    {navItems.map((item) => (
                      <Button key={item.to} variant="ghost" size="sm" asChild className="rounded-full hover:bg-white/10 hover:text-white">
                        <Link 
                          to={item.to} 
                          className="flex items-center gap-2 px-4"
                          activeProps={{ className: 'bg-white/10 text-white shadow-sm' }}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-white/10 hover:text-white text-slate-400 gap-1.5">
                      <Link to="/console/dashboard">
                        <Terminal className="h-3.5 w-3.5" />
                        Console
                      </Link>
                    </Button>
                    <div className="flex flex-col items-end mr-2">
                      <span className="text-xs font-medium text-white">{user?.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">Pro Member</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Link
                      to="/solutions/kidney-care"
                      className="px-3 py-2 text-slate-400 transition-colors hover:text-white"
                    >
                      Solutions
                    </Link>
                    <a
                      href="#"
                      className="px-3 py-2 text-slate-400 transition-colors hover:text-white"
                    >
                      Customers
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 text-slate-400 transition-colors hover:text-white"
                    >
                      Pricing
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 text-slate-400 transition-colors hover:text-white"
                    >
                      Docs
                    </a>
                  </div>
                  <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <Button variant="ghost" asChild className="text-slate-300 hover:text-white rounded-full px-5">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-5 text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.5)] hover:from-blue-400 hover:to-cyan-300"
                    >
                      <Link to="/register">Get a demo</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-nebula-deep border-white/5 text-slate-200">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-white">
                    <VoiceIcon className="h-8 w-8 text-white" />
                    VoiceAI
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-12 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      {navItems.map((item) => (
                        <Button
                          key={item.to}
                          variant="ghost"
                          className="justify-start rounded-xl h-14 text-lg"
                          asChild
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link to={item.to}>
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                      <div className="mt-auto pt-8 border-t border-white/5">
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl h-14 text-lg text-slate-400"
                          asChild
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link to="/console/dashboard">
                            <Terminal className="h-5 w-5 mr-3" />
                            Console
                          </Link>
                        </Button>
                        <div className="px-4 py-4 mb-4 bg-white/5 rounded-2xl">
                          <div className="text-sm font-bold text-white">{user?.name}</div>
                          <div className="text-xs text-slate-500">{user?.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-start h-14 text-lg rounded-xl" asChild onClick={() => setSheetOpen(false)}>
                        <Link to="/solutions/kidney-care">Solutions</Link>
                      </Button>
                      <Button variant="ghost" className="justify-start h-14 text-lg rounded-xl" asChild onClick={() => setSheetOpen(false)}>
                        <a href="#">Customers</a>
                      </Button>
                      <Button variant="ghost" className="justify-start h-14 text-lg rounded-xl" asChild onClick={() => setSheetOpen(false)}>
                        <a href="#">Pricing</a>
                      </Button>
                      <Button variant="ghost" className="justify-start h-14 text-lg rounded-xl" asChild onClick={() => setSheetOpen(false)}>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button
                        className="h-14 justify-start rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-lg text-white hover:from-blue-400 hover:to-cyan-300"
                        asChild
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link to="/register">Get a demo</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}