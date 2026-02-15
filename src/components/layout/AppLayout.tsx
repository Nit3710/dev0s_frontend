import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.store';
import { useCommandPalette } from '@/hooks/useKeyboardShortcuts';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  Activity,
  Settings,
  LogOut,
  Cpu,
  Command,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarContentProps {
  activePath: string;
  onLogout: () => void;
  onCommandPalette: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

function SidebarNav({ activePath, onLogout, onCommandPalette, isMobile, onNavigate }: SidebarContentProps) {
  return (
    <div className={cn("flex flex-col h-full py-4", isMobile ? "items-start px-4 w-full" : "items-center w-16")}>
      {/* Logo */}
      <Link to="/dashboard" className="mb-8 group" onClick={onNavigate}>
        <div className="w-10 h-10 rounded-lg glow-ai flex items-center justify-center transition-transform group-hover:scale-110">
          <Cpu className="w-5 h-5 text-primary-foreground" />
        </div>
      </Link>

      {/* Command Palette Button */}
      {isMobile ? (
        <Button
          variant="ghost"
          size="default"
          onClick={onCommandPalette}
          className="mb-4 text-sidebar-foreground hover:bg-sidebar-accent w-full justify-start gap-3 px-2"
        >
          <Command className="w-5 h-5" />
          <span>Command Palette</span>
        </Button>
      ) : (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCommandPalette}
              className="w-10 h-10 mb-4 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Command className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover flex items-center gap-2">
            <span>Command Palette</span>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Theme Toggle - Desktop Only */}
      {!isMobile && (
        <div className="mb-4">
          <ThemeToggle />
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 flex flex-col gap-2 w-full", isMobile ? "items-start" : "items-center")}>
        {navItems.map((item) => {
          const isActive = activePath.startsWith(item.path);

          const LinkContent = (
            <Link
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'rounded-lg flex items-center transition-all',
                isMobile ? 'w-full justify-start gap-3 px-2 h-10' : 'w-10 h-10 justify-center',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {isMobile && <span className="font-medium">{item.label}</span>}
            </Link>
          );

          if (isMobile) return <div key={item.path} className="w-full">{LinkContent}</div>;

          return (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                {LinkContent}
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Logout */}
      {isMobile ? (
        <Button
          variant="ghost"
          size="default"
          onClick={onLogout}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive w-full justify-start gap-3 px-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      ) : (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="w-10 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover">
            Logout
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function AppLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useCommandPalette(() => setCommandPaletteOpen(true));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-40 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg glow-ai flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">DevOS</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-r border-sidebar-border">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarNav
                activePath={location.pathname}
                onLogout={logout}
                onCommandPalette={() => {
                  setCommandPaletteOpen(true);
                  setMobileMenuOpen(false);
                }}
                isMobile={true}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 bg-sidebar border-r border-sidebar-border flex-col items-center fixed h-full z-50">
        <SidebarNav
          activePath={location.pathname}
          onLogout={logout}
          onCommandPalette={() => setCommandPaletteOpen(true)}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-16 mt-16 md:mt-0 transition-all duration-200">
        <Outlet />
      </main>
    </div>
  );
}
