import { Project, ProjectStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderKanban, 
  Clock, 
  FileCode, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

const statusConfig: Record<ProjectStatus, { 
  icon: typeof CheckCircle2; 
  label: string; 
  className: string;
  dotClass: string;
}> = {
  indexed: { 
    icon: CheckCircle2, 
    label: 'Indexed', 
    className: 'text-success',
    dotClass: 'status-dot-indexed'
  },
  indexing: { 
    icon: Loader2, 
    label: 'Indexing', 
    className: 'text-warning',
    dotClass: 'status-dot-indexing'
  },
  error: { 
    icon: AlertCircle, 
    label: 'Error', 
    className: 'text-destructive',
    dotClass: 'status-dot-error'
  },
  pending: { 
    icon: Circle, 
    label: 'Pending', 
    className: 'text-muted-foreground',
    dotClass: 'status-dot-pending'
  },
};

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <Card className="panel hover:border-primary/50 transition-all group cursor-pointer" onClick={onOpen}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                {project.path}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn('flex items-center gap-1.5', status.className)}
          >
            <span className={cn('status-dot', status.dotClass)} />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>{project.fileCount} files</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDistanceToNow(project.lastActivity, { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant="secondary" className="font-mono text-xs">
            {project.language}
          </Badge>
          <Button 
            size="sm" 
            variant="ghost" 
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Open
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
