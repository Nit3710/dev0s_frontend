import React from 'react';
import { StructuredDiffViewer } from './StructuredDiffViewer';
import { mockFileChanges } from '@/mocks/diffData';

export function DiffViewerDemo() {
  const handleApproveFile = (fileChangeId: string) => {
    console.log('Approved file:', fileChangeId);
    // In a real app, this would call the store method
    // useAIStore.getState().approveFileChange(stepId, fileChangeId);
  };

  const handleRejectFile = (fileChangeId: string) => {
    console.log('Rejected file:', fileChangeId);
    // In a real app, this would call the store method
    // useAIStore.getState().rejectFileChange(stepId, fileChangeId);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Structured Diff Viewer Demo</h1>
        <p className="text-muted-foreground">
          Review file changes with approve/reject functionality
        </p>
      </div>
      
      <div className="flex-1">
        <StructuredDiffViewer
          fileChanges={mockFileChanges}
          onApproveFile={handleApproveFile}
          onRejectFile={handleRejectFile}
          className="h-full"
        />
      </div>
    </div>
  );
}
