import { useState } from 'react';
import { useAIStore } from '@/state/ai.store';
import { AICommandPanel } from '@/components/ai/AICommandPanel';
import { ActionPlanViewer } from '@/components/ai/ActionPlanViewer';

export function Demo() {
  const [projectId] = useState('demo-project');
  const { currentPlan, messages, isStreaming } = useAIStore();

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-screen min-h-screen">
      {/* Left - AI Command Panel */}
      <div className="flex-1 flex flex-col bg-background min-h-[500px] md:min-h-0 order-first md:order-none">
        <AICommandPanel projectId={projectId} />
      </div>

      {/* Right - Action Plan */}
      <aside className="w-full md:w-96 h-96 md:h-full bg-sidebar border-t md:border-l md:border-t-0 border-sidebar-border flex flex-col shrink-0">
        <ActionPlanViewer />
      </aside>
    </div>
  );
}
