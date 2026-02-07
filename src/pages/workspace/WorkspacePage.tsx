import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/state/project.store';
import { useAIStore } from '@/state/ai.store';
import { FileTree } from '@/components/project/FileTree';
import { AICommandPanel } from '@/components/ai/AICommandPanel';
import { ActionPlanViewer } from '@/components/ai/ActionPlanViewer';
import { Loader2 } from 'lucide-react';

export function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, selectProject, isLoading } = useProjectStore();
  const { currentPlan } = useAIStore();

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  if (isLoading || !currentProject) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - File Tree */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="panel-header">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{currentProject.name}</span>
            <div className="status-dot status-dot-indexed" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <FileTree />
        </div>
      </aside>

      {/* Center - AI Command Panel */}
      <main className="flex-1 flex flex-col bg-background">
        <AICommandPanel projectId={currentProject.id} />
      </main>

      {/* Right Sidebar - Action Plan */}
      <aside className="w-96 bg-sidebar border-l border-sidebar-border flex flex-col">
        <ActionPlanViewer />
      </aside>
    </div>
  );
}
