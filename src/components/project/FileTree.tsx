import { useProjectStore } from '@/state/project.store';
import { FileNode } from '@/types';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return FileCode;
  if (fileName.endsWith('.json')) return FileJson;
  if (fileName.endsWith('.md')) return FileText;
  return File;
};

interface FileNodeItemProps {
  node: FileNode;
  depth: number;
  onToggle: (nodeId: string) => void;
}

function FileNodeItem({ node, depth, onToggle }: FileNodeItemProps) {
  const isDirectory = node.type === 'directory';
  const FileIcon = isDirectory 
    ? (node.isExpanded ? FolderOpen : Folder)
    : getFileIcon(node.name);

  return (
    <div>
      <button
        className={cn(
          'w-full flex items-center gap-1 px-2 py-1 text-sm hover:bg-sidebar-accent rounded transition-colors text-left',
          'text-sidebar-foreground hover:text-sidebar-accent-foreground'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => isDirectory && onToggle(node.id)}
      >
        {isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center">
            {node.isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!isDirectory && <span className="w-4" />}
        <FileIcon className={cn(
          'w-4 h-4 flex-shrink-0',
          isDirectory ? 'text-primary' : 'text-muted-foreground'
        )} />
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>
      
      {isDirectory && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileNodeItem 
              key={child.id} 
              node={child} 
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const { fileTree, toggleFileNode } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-8 h-8 text-xs bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {fileTree.map((node) => (
          <FileNodeItem 
            key={node.id} 
            node={node} 
            depth={0}
            onToggle={toggleFileNode}
          />
        ))}
      </div>

      {/* Index Status */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Index Status</span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot status-dot-indexed" />
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
