import { useEffect } from 'react';
import { useProjectStore } from '@/state/project.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Activity as ActivityIcon, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  AlertCircle,
  FileCode,
  GitBranch,
  Bot,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditLog, AuditAction, AuditStatus } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

const actionIcons: Record<AuditAction, typeof ActivityIcon> = {
  ai_response: Bot,
  plan_created: GitBranch,
  plan_approved: CheckCircle2,
  plan_rejected: XCircle,
  changes_applied: CheckCircle2,
  changes_rolled_back: RotateCcw,
  file_indexed: FileCode,
  error: AlertCircle,
};

const statusConfig: Record<AuditStatus, { label: string; className: string }> = {
  success: { label: 'Success', className: 'text-success border-success/30' },
  failed: { label: 'Failed', className: 'text-destructive border-destructive/30' },
  rolled_back: { label: 'Rolled Back', className: 'text-warning border-warning/30' },
  pending: { label: 'Pending', className: 'text-muted-foreground border-muted/30' },
};

function LogItem({ log }: { log: AuditLog }) {
  const Icon = actionIcons[log.action];
  const status = statusConfig[log.status];

  return (
    <div className="flex gap-4 p-4 border-b border-border hover:bg-card/50 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        log.status === 'success' && 'bg-success/10',
        log.status === 'failed' && 'bg-destructive/10',
        log.status === 'rolled_back' && 'bg-warning/10',
        log.status === 'pending' && 'bg-muted',
      )}>
        <Icon className={cn(
          'w-5 h-5',
          log.status === 'success' && 'text-success',
          log.status === 'failed' && 'text-destructive',
          log.status === 'rolled_back' && 'text-warning',
          log.status === 'pending' && 'text-muted-foreground',
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground">{log.description}</p>
          <Badge variant="outline" className={cn('text-xs', status.className)}>
            {status.label}
          </Badge>
        </div>
        
        {log.filesAffected && log.filesAffected.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {log.filesAffected.map((file) => (
              <Badge key={file} variant="secondary" className="font-mono text-xs">
                {file}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(log.timestamp, { addSuffix: true })}</span>
          <span className="mx-1">•</span>
          <span>{format(log.timestamp, 'MMM d, HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
}

export function ActivityPage() {
  const { auditLogs, fetchAuditLogs } = useProjectStore();

  useEffect(() => {
    fetchAuditLogs('1');
  }, [fetchAuditLogs]);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Track all AI actions, changes, and system events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Actions', value: auditLogs.length, icon: ActivityIcon },
          { label: 'Successful', value: auditLogs.filter(l => l.status === 'success').length, icon: CheckCircle2 },
          { label: 'Failed', value: auditLogs.filter(l => l.status === 'failed').length, icon: XCircle },
          { label: 'Rolled Back', value: auditLogs.filter(l => l.status === 'rolled_back').length, icon: RotateCcw },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity List */}
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <span className="font-medium text-foreground">Recent Activity</span>
        </div>
        <ScrollArea className="h-[600px]">
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center">
              <ActivityIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as you use DevOS
              </p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
