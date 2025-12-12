import { createRootRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { Mic, LayoutDashboard, Bot, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

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

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
    setSheetOpen(false)
  }

  const handleNavClick = () => {
    setSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                VoiceAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  {navItems.map((item) => (
                    <Button key={item.to} variant="ghost" size="sm" asChild>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <span className="text-sm text-muted-foreground px-2">{user?.name}</span>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Mic className="h-4 w-4 text-white" />
                    </div>
                    VoiceAI
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      {navItems.map((item) => (
                        <Button
                          key={item.to}
                          variant="ghost"
                          className="justify-start"
                          asChild
                          onClick={handleNavClick}
                        >
                          <Link to={item.to}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                      <Separator className="my-4" />
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Signed in as {user?.name}
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start text-destructive hover:text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-start" asChild onClick={handleNavClick}>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button className="justify-start" asChild onClick={handleNavClick}>
                        <Link to="/register">Get Started</Link>
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
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
