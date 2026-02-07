import { useAIStore } from '@/state/ai.store';
import { StructuredDiffViewer } from '@/components/diff/StructuredDiffViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Target
} from 'lucide-react';
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

export function ActionPlanViewer() {
  const { 
    currentPlan, 
    approveAllEdits, 
    applyChanges, 
    rollbackChanges, 
    isProcessing,
    approveFileChange,
    rejectFileChange,
    executePlan,
    rollbackPlan
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
  const canApply = approvedFiles === totalFiles && currentPlan.status !== 'applied' && currentPlan.status !== 'rolled_back';
  const canRollback = currentPlan.status === 'applied';

  const handleApproveFile = (fileChangeId: string) => {
    // Find which step contains this file change
    const step = currentPlan.steps.find((step) => 
      step.fileChanges.some((change) => change.id === fileChangeId)
    );
    if (step) {
      approveFileChange(step.id, fileChangeId);
    }
  };

  const handleRejectFile = (fileChangeId: string) => {
    // Find which step contains this file change
    const step = currentPlan.steps.find((step) => 
      step.fileChanges.some((change) => change.id === fileChangeId)
    );
    if (step) {
      rejectFileChange(step.id, fileChangeId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Action Plan</span>
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

      {/* File Changes */}
      <div className="flex-1">
        <StructuredDiffViewer
          fileChanges={allFileChanges}
          onApproveFile={handleApproveFile}
          onRejectFile={handleRejectFile}
          className="h-full"
        />
      </div>

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
        
        {canApply && (
          <Button 
            className="w-full glow-primary" 
            onClick={executePlan}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Apply Changes
          </Button>
        )}

        {canRollback && (
          <Button 
            className="w-full" 
            variant="destructive"
            onClick={rollbackPlan}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Rollback Changes
          </Button>
        )}

        {currentPlan.status === 'applied' && (
          <div className="flex items-center justify-center gap-2 text-success text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Changes applied successfully
          </div>
        )}

        {currentPlan.status === 'rolled_back' && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RotateCcw className="w-4 h-4" />
            Changes have been rolled back
          </div>
        )}
      </div>
    </div>
  );
}
