import React, { useState } from 'react';
import { useAIStore } from '@/state/ai.store';
import { StructuredDiffViewer } from '@/components/diff/StructuredDiffViewer';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  Check, 
  Play, 
  RotateCcw,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  List,
  History,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionPlanStatus, ExecutionStatus } from '@/types';

const statusConfig: Record<ActionPlanStatus, { label: string; className: string }> = {
  planning: { label: 'Planning...', className: 'text-info' },
  pending: { label: 'Pending Approval', className: 'text-warning' },
  approved: { label: 'Approved', className: 'text-success' },
  applying: { label: 'Applying...', className: 'text-info' },
  applied: { label: 'Applied', className: 'text-success' },
  rejected: { label: 'Rejected', className: 'text-destructive' },
  rolled_back: { label: 'Rolled Back', className: 'text-muted-foreground' },
};

const priorityConfig: Record<string, { label: string; className: string; icon: React.ComponentType<any> }> = {
  low: { label: 'Low', className: 'text-muted-foreground', icon: Clock },
  medium: { label: 'Medium', className: 'text-info', icon: Target },
  high: { label: 'High', className: 'text-warning', icon: Zap },
  critical: { label: 'Critical', className: 'text-destructive', icon: AlertTriangle },
};

function ExecutionProgress({ plan }: { plan: any }) {
  const allFileChanges = plan.steps.flatMap((step: any) => step.fileChanges);
  const totalFiles = allFileChanges.length;
  const completedFiles = allFileChanges.filter((f: any) => f.status === 'completed').length;
  const failedFiles = allFileChanges.filter((f: any) => f.status === 'failed').length;
  const runningFiles = allFileChanges.filter((f: any) => f.status === 'running').length;
  
  const progress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <div className="p-4 border-b border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Execution Progress</span>
        <span className="text-sm text-muted-foreground">{completedFiles}/{totalFiles} files</span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center">
          <div className="font-medium text-success">{completedFiles}</div>
          <div className="text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-info">{runningFiles}</div>
          <div className="text-muted-foreground">Running</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-destructive">{failedFiles}</div>
          <div className="text-muted-foreground">Failed</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{totalFiles - completedFiles - runningFiles - failedFiles}</div>
          <div className="text-muted-foreground">Pending</div>
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (!error) return null;

  return (
    <div className="m-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive mb-1">Error Occurred</h4>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EnhancedActionPlanViewer() {
  const [activeTab, setActiveTab] = useState('files');
  const { 
    currentPlan, 
    approveAllEdits, 
    executePlan, 
    rollbackPlan,
    isProcessing,
    error,
    approveFileChange,
    rejectFileChange,
    addAuditLog,
    getAuditLogs
  } = useAIStore();

  if (!currentPlan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <GitBranch className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">No action plan</h3>
        <p className="text-sm text-muted-foreground">
          Send a command to the AI to generate an action plan with proposed code changes.
        </p>
      </div>
    );
  }

  const status = statusConfig[currentPlan.status];
  const allFileChanges = currentPlan.steps.flatMap((step) => step.fileChanges);
  const approvedFiles = allFileChanges.filter(f => f.status === 'completed').length;
  const totalFiles = allFileChanges.length;
  const canExecute = approvedFiles === totalFiles && currentPlan.status === 'pending';
  const canRollback = currentPlan.status === 'applied';
  const hasErrors = allFileChanges.some(f => f.status === 'failed');

  const handleApproveFile = (fileChangeId: string) => {
    const step = currentPlan.steps.find((step) => 
      step.fileChanges.some((change) => change.id === fileChangeId)
    );
    if (step) {
      approveFileChange(step.id, fileChangeId);
      addAuditLog({
        action: 'file_approved',
        description: `Approved file change: ${allFileChanges.find(f => f.id === fileChangeId)?.filePath}`,
        status: 'success',
        projectId: 'current',
        fileChangeId,
      });
    }
  };

  const handleRejectFile = (fileChangeId: string) => {
    const step = currentPlan.steps.find((step) => 
      step.fileChanges.some((change) => change.id === fileChangeId)
    );
    if (step) {
      rejectFileChange(step.id, fileChangeId);
      addAuditLog({
        action: 'file_rejected',
        description: `Rejected file change: ${allFileChanges.find(f => f.id === fileChangeId)?.filePath}`,
        status: 'success',
        projectId: 'current',
        fileChangeId,
      });
    }
  };

  const handleRollbackFile = (fileChangeId: string) => {
    // Mock rollback functionality
    addAuditLog({
      action: 'file_rollback',
      description: `Rolled back file change: ${allFileChanges.find(f => f.id === fileChangeId)?.filePath}`,
      status: 'success',
      projectId: 'current',
      fileChangeId,
    });
  };

  const handleRetryFile = (fileChangeId: string) => {
    // Mock retry functionality
    addAuditLog({
      action: 'file_applied',
      description: `Retried file change: ${allFileChanges.find(f => f.id === fileChangeId)?.filePath}`,
      status: 'running',
      projectId: 'current',
      fileChangeId,
    });
  };

  const handleExecutePlan = async () => {
    addAuditLog({
      action: 'plan_executed',
      description: `Started executing plan: ${currentPlan.title}`,
      status: 'running',
      projectId: 'current',
    });
    
    try {
      await executePlan();
      addAuditLog({
        action: 'plan_executed',
        description: `Successfully executed plan: ${currentPlan.title}`,
        status: 'success',
        projectId: 'current',
        filesAffected: allFileChanges.map(f => f.filePath),
        duration: 5000, // Mock duration
      });
    } catch (error) {
      addAuditLog({
        action: 'error',
        description: `Failed to execute plan: ${currentPlan.title}`,
        status: 'failed',
        projectId: 'current',
        error: {
          code: 'EXECUTION_FAILED',
          message: error as string,
        },
      });
    }
  };

  const handleRollbackPlan = async () => {
    addAuditLog({
      action: 'plan_rolled_back',
      description: `Started rolling back plan: ${currentPlan.title}`,
      status: 'running',
      projectId: 'current',
    });
    
    try {
      await rollbackPlan();
      addAuditLog({
        action: 'plan_rolled_back',
        description: `Successfully rolled back plan: ${currentPlan.title}`,
        status: 'success',
        projectId: 'current',
        filesAffected: allFileChanges.map(f => f.filePath),
        duration: 3000, // Mock duration
      });
    } catch (error) {
      addAuditLog({
        action: 'error',
        description: `Failed to rollback plan: ${currentPlan.title}`,
        status: 'failed',
        projectId: 'current',
        error: {
          code: 'ROLLBACK_FAILED',
          message: error as string,
        },
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="panel-header border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Action Plan</span>
              {hasErrors && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Has Errors
                </Badge>
              )}
            </div>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Plan Info */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground mb-1">{currentPlan.title}</h3>
          <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </Badge>
            <Badge variant="secondary">
              {approvedFiles} approved
            </Badge>
            {currentPlan.priority && (
              <Badge variant="outline" className={priorityConfig[currentPlan.priority]?.className}>
                {priorityConfig[currentPlan.priority]?.label} Priority
              </Badge>
            )}
          </div>
        </div>

        {/* Execution Progress */}
        <ExecutionProgress plan={currentPlan} />

        {/* Error Display */}
        <ErrorDisplay error={error} onRetry={handleExecutePlan} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                File Changes ({totalFiles})
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Audit Log ({getAuditLogs().length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="files" className="flex-1 m-0">
            <ErrorBoundary>
              <StructuredDiffViewer
                fileChanges={allFileChanges}
                onApproveFile={handleApproveFile}
                onRejectFile={handleRejectFile}
                onRollbackFile={handleRollbackFile}
                onRetryFile={handleRetryFile}
                className="h-full"
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="audit" className="flex-1 m-0">
            <ErrorBoundary>
              <AuditLogViewer logs={getAuditLogs()} className="h-full" />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {currentPlan.status === 'pending' && (
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={approveAllEdits}
              disabled={approvedFiles === totalFiles}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve All Changes
            </Button>
          )}
          
          {canExecute && (
            <Button 
              className="w-full glow-primary" 
              onClick={handleExecutePlan}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Execute Plan
            </Button>
          )}

          {canRollback && (
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={handleRollbackPlan}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Rollback Plan
            </Button>
          )}

          {currentPlan.status === 'applied' && (
            <div className="flex items-center justify-center gap-2 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Plan executed successfully
            </div>
          )}

          {currentPlan.status === 'rolled_back' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <RotateCcw className="w-4 h-4" />
              Plan has been rolled back
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
