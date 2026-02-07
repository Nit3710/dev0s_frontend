import { useAIStore } from '@/state/ai.store';
import { StructuredDiffViewer } from '@/components/diff/StructuredDiffViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

function PlanSummary({ plan }: { plan: any }) {
  const summary = useAIStore(state => state.getPlanSummary());
  
  if (!summary) return null;

  const PriorityIcon = priorityConfig[plan.priority]?.icon || Target;
  
  return (
    <div className="p-4 border-b border-border space-y-3">
      {/* Priority and Risk */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{priorityConfig[plan.priority]?.label} Priority</span>
        </div>
        <Badge variant="outline" className={cn(
          'text-xs',
          plan.metadata.riskLevel === 'low' && 'text-success border-success/30',
          plan.metadata.riskLevel === 'medium' && 'text-warning border-warning/30',
          plan.metadata.riskLevel === 'high' && 'text-destructive border-destructive/30',
        )}>
          {plan.metadata.riskLevel.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{summary.completedSteps}/{summary.totalSteps} steps</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(summary.completedSteps / summary.totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Duration</span>
          <div className="font-medium">
            {Math.floor(summary.estimatedDuration / 60)}m {summary.estimatedDuration % 60}s
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Files</span>
          <div className="font-medium">{summary.totalFileChanges}</div>
        </div>
      </div>

      {/* Requirements */}
      <div className="flex flex-wrap gap-2">
        {plan.metadata.requiresGit && (
          <Badge variant="outline" className="text-xs">Git Required</Badge>
        )}
        {plan.metadata.requiresBuild && (
          <Badge variant="outline" className="text-xs">Build Required</Badge>
        )}
        {plan.metadata.requiresTest && (
          <Badge variant="outline" className="text-xs">Tests Required</Badge>
        )}
        {summary.requiresUserAction && (
          <Badge variant="outline" className="text-xs text-warning border-warning/30">
            User Action Required
          </Badge>
        )}
      </div>
    </div>
  );
}

function StepList({ plan }: { plan: any }) {
  const { executeStep, approveStep, rejectStep, updateStepProgress } = useAIStore();
  
  const handleStepAction = (stepId: string, action: 'execute' | 'approve' | 'reject') => {
    switch (action) {
      case 'execute':
        executeStep(stepId);
        break;
      case 'approve':
        approveStep(stepId);
        break;
      case 'reject':
        rejectStep(stepId);
        break;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'analysis': return Target;
      case 'planning': return GitBranch;
      case 'validation': return CheckCircle2;
      case 'backup': return RotateCcw;
      case 'file_operation': return Play;
      case 'test': return CheckCircle2;
      case 'cleanup': return RotateCcw;
      default: return Play;
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-medium text-foreground">Execution Steps</h3>
      {plan.steps.map((step: any, index: number) => {
        const StepIcon = getStepIcon(step.type);
        const isRunning = step.status === 'running';
        const canExecute = step.status === 'pending' && step.dependencies.every((depId: string) => 
          plan.steps.find((s: any) => s.id === depId)?.status === 'completed'
        );
        
        return (
          <div key={step.id} className="border border-border rounded-lg p-3 bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                  {index + 1}
                </div>
                <StepIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{step.title}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {step.status === 'running' && (
                  <Loader2 className="w-3 h-3 animate-spin text-info" />
                )}
                <Badge variant="outline" className={cn(
                  'text-xs',
                  step.status === 'completed' && 'text-success border-success/30',
                  step.status === 'failed' && 'text-destructive border-destructive/30',
                  step.status === 'running' && 'text-info border-info/30',
                )}>
                  {step.status}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2">{step.description}</p>

            {/* Progress */}
            {isRunning && step.progress !== undefined && (
              <div className="mb-2">
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className="bg-info h-1 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* File Changes Count */}
            {step.fileChanges.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                {step.fileChanges.length} file change{step.fileChanges.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canExecute && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStepAction(step.id, 'execute')}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Execute
                </Button>
              )}
              {step.status === 'pending' && step.metadata.requiresUserConfirmation && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStepAction(step.id, 'approve')}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStepAction(step.id, 'reject')}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>

            {/* Dependencies */}
            {step.dependencies.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Depends on: {step.dependencies.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StructuredActionPlanViewer() {
  const { currentPlan, executePlan, rollbackPlan, validatePlan, isProcessing } = useAIStore();

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
  const allFileChanges = currentPlan.steps.flatMap((step: any) => step.fileChanges);
  const canExecute = currentPlan.status === 'pending' || currentPlan.status === 'approved';
  const canRollback = currentPlan.status === 'applied';

  const handleApproveFile = (fileChangeId: string) => {
    // Find which step contains this file change
    const step = currentPlan.steps.find((step: any) => 
      step.fileChanges.some((change: any) => change.id === fileChangeId)
    );
    if (step) {
      useAIStore.getState().approveFileChange(step.id, fileChangeId);
    }
  };

  const handleRejectFile = (fileChangeId: string) => {
    // Find which step contains this file change
    const step = currentPlan.steps.find((step: any) => 
      step.fileChanges.some((change: any) => change.id === fileChangeId)
    );
    if (step) {
      useAIStore.getState().rejectFileChange(step.id, fileChangeId);
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
      </div>

      {/* Plan Summary */}
      <PlanSummary plan={currentPlan} />

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
            File Changes ({allFileChanges.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Steps ({currentPlan.steps.length})
          </button>
        </div>
      </div>

      {/* Content */}
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
        {canExecute && (
          <>
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={() => validatePlan()}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              Validate Plan
            </Button>
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
              Execute Plan
            </Button>
          </>
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
  );
}
