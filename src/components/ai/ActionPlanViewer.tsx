import { useAIStore } from '@/state/ai.store';
import { DiffViewer } from '@/components/diff/DiffViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  Check, 
  X, 
  Play, 
  RotateCcw,
  FileCode,
  FilePlus,
  FileX,
  FilePen,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeEdit, ActionPlanStatus } from '@/types';

const editTypeIcons = {
  create: FilePlus,
  modify: FilePen,
  delete: FileX,
  rename: FileCode,
};

const editTypeLabels = {
  create: 'Create',
  modify: 'Modify',
  delete: 'Delete',
  rename: 'Rename',
};

const statusConfig: Record<ActionPlanStatus, { label: string; className: string }> = {
  planning: { label: 'Planning...', className: 'text-info' },
  pending: { label: 'Pending Approval', className: 'text-warning' },
  approved: { label: 'Approved', className: 'text-success' },
  applying: { label: 'Applying...', className: 'text-info' },
  applied: { label: 'Applied', className: 'text-success' },
  rejected: { label: 'Rejected', className: 'text-destructive' },
  rolled_back: { label: 'Rolled Back', className: 'text-muted-foreground' },
};

function EditItem({ edit }: { edit: CodeEdit }) {
  const { approveEdit, rejectEdit } = useAIStore();
  const Icon = editTypeIcons[edit.type];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-panel-header">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            'w-4 h-4',
            edit.type === 'create' && 'text-success',
            edit.type === 'delete' && 'text-destructive',
            edit.type === 'modify' && 'text-info',
            edit.type === 'rename' && 'text-warning',
          )} />
          <span className="font-mono text-xs text-foreground truncate max-w-[200px]">
            {edit.filePath}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {edit.status === 'pending' ? (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 hover:bg-success/20 hover:text-success"
                onClick={() => approveEdit(edit.id)}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                onClick={() => rejectEdit(edit.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                edit.status === 'approved' && 'text-success border-success/30',
                edit.status === 'rejected' && 'text-destructive border-destructive/30',
                edit.status === 'applied' && 'text-success border-success/30',
              )}
            >
              {edit.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {edit.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {edit.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {edit.description && (
        <p className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
          {edit.description}
        </p>
      )}

      {/* Diff */}
      <DiffViewer chunks={edit.diff} />
    </div>
  );
}

export function ActionPlanViewer() {
  const { currentPlan, approveAllEdits, applyChanges, rollbackChanges, isProcessing } = useAIStore();

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
  const allApproved = currentPlan.edits.every(e => e.status === 'approved');
  const someApproved = currentPlan.edits.some(e => e.status === 'approved');
  const canApply = allApproved && currentPlan.status !== 'applied' && currentPlan.status !== 'rolled_back';
  const canRollback = currentPlan.status === 'applied';

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
            {currentPlan.edits.length} {currentPlan.edits.length === 1 ? 'file' : 'files'}
          </Badge>
          <Badge variant="secondary">
            {currentPlan.edits.filter(e => e.status === 'approved').length} approved
          </Badge>
        </div>
      </div>

      {/* Edits List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentPlan.edits.map((edit) => (
            <EditItem key={edit.id} edit={edit} />
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {currentPlan.status === 'pending' && (
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={approveAllEdits}
            disabled={allApproved}
          >
            <Check className="w-4 h-4 mr-2" />
            Approve All Changes
          </Button>
        )}
        
        {canApply && (
          <Button 
            className="w-full glow-primary" 
            onClick={applyChanges}
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
            onClick={rollbackChanges}
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
