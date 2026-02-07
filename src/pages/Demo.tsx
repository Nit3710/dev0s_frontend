import { useState } from 'react';
import { useAIStore } from '@/state/ai.store';
import { AICommandPanel } from '@/components/ai/AICommandPanel';
import { ActionPlanViewer } from '@/components/ai/ActionPlanViewer';

export function Demo() {
  const [projectId] = useState('demo-project');
  const { currentPlan, messages, isStreaming } = useAIStore();

  return (
    <div className="h-screen flex">
      {/* Left - AI Command Panel */}
      <div className="flex-1 flex flex-col bg-background">
        <AICommandPanel projectId={projectId} />
      </div>

      {/* Right - Action Plan */}
      <aside className="w-96 bg-sidebar border-l border-sidebar-border flex flex-col">
        <ActionPlanViewer />
      </aside>
    </div>
  );
}
