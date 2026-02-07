import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  AlertTriangle,
  FileText,
  GitBranch,
  Play,
  Zap,
  ChevronDown,
  ChevronRight,
  Info,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditLog, AuditAction, AuditStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogViewerProps {
  logs: AuditLog[];
  className?: string;
}

const actionConfig: Record<AuditAction, { label: string; icon: React.ComponentType<any>; color: string }> = {
  ai_response: { label: 'AI Response', icon: Zap, color: 'text-info' },
  plan_created: { label: 'Plan Created', icon: GitBranch, color: 'text-primary' },
  plan_approved: { label: 'Plan Approved', icon: CheckCircle2, color: 'text-success' },
  plan_rejected: { label: 'Plan Rejected', icon: XCircle, color: 'text-destructive' },
  plan_executed: { label: 'Plan Executed', icon: Play, color: 'text-success' },
  plan_rolled_back: { label: 'Plan Rolled Back', icon: RotateCcw, color: 'text-warning' },
  file_approved: { label: 'File Approved', icon: CheckCircle2, color: 'text-success' },
  file_rejected: { label: 'File Rejected', icon: XCircle, color: 'text-destructive' },
  file_applied: { label: 'File Applied', icon: FileText, color: 'text-success' },
  file_rollback: { label: 'File Rollback', icon: RotateCcw, color: 'text-warning' },
  step_started: { label: 'Step Started', icon: Play, color: 'text-info' },
  step_completed: { label: 'Step Completed', icon: CheckCircle2, color: 'text-success' },
  step_failed: { label: 'Step Failed', icon: XCircle, color: 'text-destructive' },
  error: { label: 'Error', icon: AlertTriangle, color: 'text-destructive' },
  validation_failed: { label: 'Validation Failed', icon: XCircle, color: 'text-destructive' },
  backup_created: { label: 'Backup Created', icon: Archive, color: 'text-info' },
  backup_restored: { label: 'Backup Restored', icon: RotateCcw, color: 'text-warning' },
};

const statusConfig: Record<AuditStatus, { label: string; className: string }> = {
  success: { label: 'Success', className: 'text-success border-success/30' },
  failed: { label: 'Failed', className: 'text-destructive border-destructive/30' },
  rolled_back: { label: 'Rolled Back', className: 'text-warning border-warning/30' },
  pending: { label: 'Pending', className: 'text-warning border-warning/30' },
  running: { label: 'Running', className: 'text-info border-info/30' },
};

function AuditLogItem({ log }: { log: AuditLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const action = actionConfig[log.action];
  const status = statusConfig[log.status];
  const ActionIcon = action.icon;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="p-3 bg-panel-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActionIcon className={cn('w-4 h-4', action.color)} />
            <span className="font-medium text-sm">{action.label}</span>
            <Badge variant="outline" className={cn('text-xs', status.className)}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {log.duration && (
              <span>{(log.duration / 1000).toFixed(2)}s</span>
            )}
            <span>{formatDistanceToNow(log.timestamp, { addSuffix: true })}</span>
          </div>
        </div>
        <p className="text-sm text-foreground mt-1">{log.description}</p>
      </div>

      {/* Expandable Details */}
      {(log.filesAffected || log.error || log.stepId || log.fileChangeId || log.metadata) && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-3">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 mr-2" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-2" />
              )}
              Details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-2">
              {/* Files Affected */}
              {log.filesAffected && log.filesAffected.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Files Affected:</div>
                  <div className="space-y-1">
                    {log.filesAffected.map((file, index) => (
                      <div key={index} className="text-xs font-mono bg-muted/50 p-1 rounded">
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Details */}
              {log.error && (
                <div>
                  <div className="text-xs font-medium text-destructive mb-1">Error Details:</div>
                  <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
                    <div className="text-xs font-mono text-destructive">
                      <div className="font-semibold">{log.error.code}</div>
                      <div>{log.error.message}</div>
                      {log.error.stack && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs opacity-70">Stack Trace</summary>
                          <pre className="text-xs mt-1 whitespace-pre-wrap opacity-80">
                            {log.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step/File References */}
              {(log.stepId || log.fileChangeId) && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">References:</div>
                  <div className="space-y-1">
                    {log.stepId && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Step ID:</span> {log.stepId}
                      </div>
                    )}
                    {log.fileChangeId && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">File Change ID:</span> {log.fileChangeId}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Metadata:</div>
                  <div className="space-y-1">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-muted-foreground">{key}:</span>{' '}
                        <span className="font-mono">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function AuditLogViewer({ logs, className }: AuditLogViewerProps) {
  const [filter, setFilter] = useState<AuditStatus | 'all'>('all');

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.status === filter);

  const statusCounts = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<AuditStatus, number>);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground mb-3">Audit Log</h3>
        
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({logs.length})
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusCounts[status as AuditStatus] || 0;
            if (count === 0) return null;
            return (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as AuditStatus)}
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Log List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No audit logs found</p>
            </div>
          ) : (
            filteredLogs
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((log) => (
                <AuditLogItem key={log.id} log={log} />
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
