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
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useCommandPalette(() => setCommandPaletteOpen(true));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />

      {/* Sidebar */}
      <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 fixed h-full z-50">
        {/* Logo */}
        <Link to="/dashboard" className="mb-8 group">
          <div className="w-10 h-10 rounded-lg glow-ai flex items-center justify-center transition-transform group-hover:scale-110">
            <Cpu className="w-5 h-5 text-primary-foreground" />
          </div>
        </Link>

        {/* Command Palette Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandPaletteOpen(true)}
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

        {/* Theme Toggle */}
        <div className="mb-4">
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Logout */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="w-10 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover">
            Logout
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-16">
        <Outlet />
      </main>
    </div>
  );
}
