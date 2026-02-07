import { DiffChunk, DiffLine } from '@/types';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  chunks: DiffChunk[];
  showLineNumbers?: boolean;
}

function DiffLineItem({ line, showLineNumbers }: { line: DiffLine; showLineNumbers?: boolean }) {
  return (
    <div className={cn(
      'flex font-mono text-xs',
      line.type === 'added' && 'diff-added',
      line.type === 'removed' && 'diff-removed',
      line.type === 'context' && 'bg-transparent',
    )}>
      {showLineNumbers !== false && (
        <>
          <span className="w-10 text-center text-muted-foreground/50 select-none border-r border-border/50 flex-shrink-0">
            {line.oldLineNumber || ''}
          </span>
          <span className="w-10 text-center text-muted-foreground/50 select-none border-r border-border/50 flex-shrink-0">
            {line.newLineNumber || ''}
          </span>
        </>
      )}
      <span className={cn(
        'w-6 text-center select-none flex-shrink-0',
        line.type === 'added' && 'text-success',
        line.type === 'removed' && 'text-destructive',
      )}>
        {line.type === 'added' && '+'}
        {line.type === 'removed' && '-'}
        {line.type === 'context' && ' '}
      </span>
      <pre className="flex-1 px-2 whitespace-pre-wrap break-all">
        {line.content}
      </pre>
    </div>
  );
}

export function DiffViewer({ chunks, showLineNumbers = true }: DiffViewerProps) {
  if (!chunks || chunks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No changes to display
      </div>
    );
  }

  return (
    <div className="bg-code-bg overflow-hidden">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="border-b border-border/30 last:border-b-0">
          <div className="bg-panel-header px-3 py-1 text-xs text-muted-foreground font-mono">
            @@ -{chunk.startLine},{chunk.endLine} @@
          </div>
          <div>
            {chunk.lines.map((line, index) => (
              <DiffLineItem 
                key={index} 
                line={line} 
                showLineNumbers={showLineNumbers}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
