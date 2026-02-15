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
    <div className="flex flex-col md:flex-row h-auto md:h-screen min-h-screen">
      {/* Left Sidebar - File Tree */}
      <aside className="w-full md:w-64 h-64 md:h-full bg-sidebar border-b md:border-r md:border-b-0 border-sidebar-border flex flex-col shrink-0">
        <div className="panel-header">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground truncate px-2">{currentProject.name}</span>
            <div className="status-dot status-dot-indexed shrink-0" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <FileTree />
        </div>
      </aside>

      {/* Center - AI Command Panel */}
      <main className="flex-1 flex flex-col bg-background min-h-[600px] md:min-h-0 order-first md:order-none">
        <AICommandPanel projectId={currentProject.id} />
      </main>

      {/* Right Sidebar - Action Plan */}
      <aside className="w-full md:w-96 h-96 md:h-full bg-sidebar border-t md:border-l md:border-t-0 border-sidebar-border flex flex-col shrink-0">
        <ActionPlanViewer />
      </aside>
    </div>
  );
}
