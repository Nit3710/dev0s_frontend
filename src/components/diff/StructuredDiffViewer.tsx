import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  FileText, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  FilePlus,
  FileEdit,
  FileX,
  Copy,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiffChunk, DiffLine, FileChange, ExecutionStatus } from '@/types';

interface DiffViewerProps {
  fileChanges: FileChange[];
  onApproveFile: (fileChangeId: string) => void;
  onRejectFile: (fileChangeId: string) => void;
  onRollbackFile?: (fileChangeId: string) => void;
  onRetryFile?: (fileChangeId: string) => void;
  className?: string;
}

const operationIcons = {
  create: FilePlus,
  modify: FileEdit,
  delete: FileX,
  rename: Copy,
  copy: Copy,
  move: Copy,
};

const operationLabels = {
  create: 'Created',
  modify: 'Modified',
  delete: 'Deleted',
  rename: 'Renamed',
  copy: 'Copied',
  move: 'Moved',
};

const statusConfig: Record<ExecutionStatus, { label: string; className: string; icon?: React.ComponentType<any> }> = {
  pending: { label: 'Pending', className: 'text-warning', icon: Clock },
  running: { label: 'Processing', className: 'text-info', icon: Loader2 },
  completed: { label: 'Applied', className: 'text-success', icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'text-destructive', icon: XCircle },
  cancelled: { label: 'Cancelled', className: 'text-muted-foreground' },
  rollback_pending: { label: 'Rollback Pending', className: 'text-warning', icon: RotateCcw },
  rollback_running: { label: 'Rolling Back', className: 'text-info', icon: Loader2 },
  rollback_completed: { label: 'Rolled Back', className: 'text-muted-foreground', icon: RotateCcw },
};

function DiffLineItem({ line, showLineNumbers = true }: { line: DiffLine; showLineNumbers?: boolean }) {
  const isAdded = line.type === 'added';
  const isRemoved = line.type === 'removed';
  const isContext = line.type === 'context';

  return (
    <div className="flex font-mono text-xs min-h-[20px] group">
      {showLineNumbers && (
        <>
          <div className="w-12 text-center text-muted-foreground/50 select-none border-r border-border/50 bg-muted/30">
            {line.oldLineNumber || ''}
          </div>
          <div className="w-12 text-center text-muted-foreground/50 select-none border-r border-border/50 bg-muted/30">
            {line.newLineNumber || ''}
          </div>
        </>
      )}
      <div className={cn(
        'w-8 text-center select-none flex-shrink-0',
        isAdded && 'bg-success/20 text-success',
        isRemoved && 'bg-destructive/20 text-destructive',
        isContext && 'bg-transparent'
      )}>
        {isAdded && '+'}
        {isRemoved && '-'}
        {isContext && ' '}
      </div>
      <div className={cn(
        'flex-1 px-3 py-0.5 whitespace-pre-wrap break-all',
        isAdded && 'bg-success/10',
        isRemoved && 'bg-destructive/10',
        isContext && 'bg-transparent'
      )}>
        {line.content || ' '}
      </div>
    </div>
  );
}

function FileDiffViewer({ fileChange }: { fileChange: FileChange }) {
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  
  const toggleChunk = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  if (!fileChange.diff || fileChange.diff.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No diff available for this file
      </div>
    );
  }

  return (
    <div className="bg-code-bg rounded-lg overflow-hidden">
      {fileChange.diff.map((chunk) => {
        const isExpanded = expandedChunks.has(chunk.id);
        const addedLines = chunk.lines.filter(l => l.type === 'added').length;
        const removedLines = chunk.lines.filter(l => l.type === 'removed').length;
        
        return (
          <div key={chunk.id} className="border-b border-border/30 last:border-b-0">
            {/* Chunk Header */}
            <button
              onClick={() => toggleChunk(chunk.id)}
              className="w-full px-3 py-2 bg-panel-header hover:bg-panel-header/80 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span className="font-mono">
                  @@ -{chunk.startLine},{chunk.endLine} @@
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {addedLines > 0 && (
                  <Badge variant="outline" className="text-xs text-success border-success/30">
                    +{addedLines}
                  </Badge>
                )}
                {removedLines > 0 && (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                    -{removedLines}
                  </Badge>
                )}
              </div>
            </button>
            
            {/* Chunk Content */}
            {isExpanded && (
              <div>
                {chunk.lines.map((line, index) => (
                  <DiffLineItem 
                    key={`${chunk.id}-${index}`} 
                    line={line} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StructuredDiffViewer({ 
  fileChanges, 
  onApproveFile, 
  onRejectFile, 
  onRollbackFile,
  onRetryFile,
  className 
}: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (fileChangeId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileChangeId)) {
      newExpanded.delete(fileChangeId);
    } else {
      newExpanded.add(fileChangeId);
    }
    setExpandedFiles(newExpanded);
  };

  const totalFiles = fileChanges.length;
  const approvedFiles = fileChanges.filter(f => f.status === 'completed').length;
  const rejectedFiles = fileChanges.filter(f => f.status === 'failed').length;
  const pendingFiles = fileChanges.filter(f => f.status === 'pending').length;

  if (fileChanges.length === 0) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center text-center p-6", className)}>
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">No file changes</h3>
        <p className="text-sm text-muted-foreground">
          There are no file changes to review in this action plan.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">File Changes</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </Badge>
            {approvedFiles > 0 && (
              <Badge variant="outline" className="text-xs text-success border-success/30">
                {approvedFiles} approved
              </Badge>
            )}
            {rejectedFiles > 0 && (
              <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                {rejectedFiles} rejected
              </Badge>
            )}
            {pendingFiles > 0 && (
              <Badge variant="outline" className="text-xs text-warning border-warning/30">
                {pendingFiles} pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {fileChanges.map((fileChange) => {
            const isExpanded = expandedFiles.has(fileChange.id);
            const Icon = operationIcons[fileChange.operation];
            const status = statusConfig[fileChange.status];
            
            return (
              <div key={fileChange.id} className="border border-border rounded-lg overflow-hidden bg-card">
                {/* File Header */}
                <div className="flex items-center justify-between p-3 bg-panel-header border-b border-border">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => toggleFile(fileChange.id)}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Icon className={cn(
                        'w-4 h-4',
                        fileChange.operation === 'create' && 'text-success',
                        fileChange.operation === 'delete' && 'text-destructive',
                        fileChange.operation === 'modify' && 'text-info',
                        fileChange.operation === 'rename' && 'text-warning',
                      )} />
                      <span className="font-mono text-xs text-foreground truncate">
                        {fileChange.filePath}
                        {fileChange.newPath && (
                          <span className="text-muted-foreground">
                            {' → '}{fileChange.newPath}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs', status.className)}>
                      {status.icon && <status.icon className="w-3 h-3 mr-1" />}
                      {status.label}
                    </Badge>
                    
                    {fileChange.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 hover:bg-success/20 hover:text-success"
                          onClick={() => onApproveFile(fileChange.id)}
                          title="Approve file change"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                          onClick={() => onRejectFile(fileChange.id)}
                          title="Reject file change"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    {fileChange.status === 'completed' && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 hover:bg-warning/20 hover:text-warning"
                        onClick={() => onRollbackFile?.(fileChange.id)}
                        title="Rollback file change"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {fileChange.status === 'failed' && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 hover:bg-warning/20 hover:text-warning"
                        onClick={() => onRetryFile?.(fileChange.id)}
                        title="Retry file change"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* File Metadata */}
                <div className="px-3 py-2 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{operationLabels[fileChange.operation]}</span>
                    {fileChange.metadata.linesAdded > 0 && (
                      <span className="text-success">+{fileChange.metadata.linesAdded} lines</span>
                    )}
                    {fileChange.metadata.linesRemoved > 0 && (
                      <span className="text-destructive">-{fileChange.metadata.linesRemoved} lines</span>
                    )}
                    <span>{fileChange.metadata.fileType}</span>
                    <span>{(fileChange.metadata.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                {/* Diff Content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <FileDiffViewer fileChange={fileChange} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
