import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '@/state/project.store';
import { useAuthStore } from '@/state/auth.store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Activity,
  Settings,
  FolderOpen,
  LogOut,
  Search,
  FileCode,
  GitBranch,
  RefreshCw,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, selectProject } = useProjectStore();
  const { logout } = useAuthStore();

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Go to Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Go to Activity', path: '/activity' },
    { icon: Settings, label: 'Go to Settings', path: '/settings' },
  ];

  const actionItems = [
    { icon: Search, label: 'Search in project...', action: () => {} },
    { icon: RefreshCw, label: 'Refresh project index', action: () => {} },
    { icon: GitBranch, label: 'Switch branch', action: () => {} },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => runCommand(() => navigate(item.path))}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <span className="ml-auto text-xs text-muted-foreground">current</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => runCommand(() => {
                selectProject(project.id);
                navigate(`/workspace/${project.id}`);
              })}
              className="cursor-pointer"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>{project.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {project.status}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => runCommand(() => {
              logout();
              navigate('/login');
            })}
            className="cursor-pointer text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
