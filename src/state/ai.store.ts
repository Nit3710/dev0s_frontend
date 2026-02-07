import { create } from 'zustand';
import { AIMessage, ActionPlan, CodeEdit, PlanStep, FileChange, ExecutionStatus, PlanSummary, AuditLog } from '@/types';
import { devosApi } from '@/api/devos.api';

interface AIState {
  messages: AIMessage[];
  currentPlan: ActionPlan | null;
  isStreaming: boolean;
  isProcessing: boolean;
  error: string | null;
  auditLogs: AuditLog[];

  // Legacy methods for backward compatibility
  sendMessage: (projectId: string, content: string) => Promise<void>;
  fetchActionPlan: (planId: string) => Promise<void>;
  approveEdit: (editId: string) => void;
  rejectEdit: (editId: string) => void;
  approveAllEdits: () => void;
  applyChanges: () => Promise<void>;
  rollbackChanges: () => Promise<void>;
  clearMessages: () => void;
  createActionPlanFromResponse: (response: string, projectId: string) => Promise<void>;

  // New structured state management methods
  executeStep: (stepId: string) => Promise<void>;
  approveStep: (stepId: string) => void;
  rejectStep: (stepId: string) => void;
  approveFileChange: (stepId: string, fileChangeId: string) => void;
  rejectFileChange: (stepId: string, fileChangeId: string) => void;
  updateStepProgress: (stepId: string, progress: number) => void;
  executePlan: () => Promise<void>;
  rollbackPlan: () => Promise<void>;
  validatePlan: () => Promise<boolean>;
  getPlanSummary: () => PlanSummary | null;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getAuditLogs: () => AuditLog[];
  clearAuditLogs: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  currentPlan: null,
  isStreaming: false,
  isProcessing: false,
  error: null,
  auditLogs: [],

  sendMessage: async (projectId: string, content: string) => {
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'complete',
    };
    set(state => ({ messages: [...state.messages, userMessage] }));

    // Start streaming
    set({ isStreaming: true, error: null });

    // Add pending assistant message
    const pendingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming',
    };
    set(state => ({ messages: [...state.messages, pendingMessage] }));

    try {
      // Simulate streaming response
      const response = await devosApi.sendMessage(projectId, content);
      
      // Simulate character-by-character streaming
      const fullContent = response.content;
      let currentContent = '';
      
      for (let i = 0; i < fullContent.length; i++) {
        currentContent += fullContent[i];
        set(state => ({
          messages: state.messages.map(m => 
            m.id === pendingMessage.id 
              ? { ...m, content: currentContent }
              : m
          ),
        }));
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Complete the message
      set(state => ({
        messages: state.messages.map(m => 
          m.id === pendingMessage.id 
            ? { ...m, status: 'complete' }
            : m
        ),
        isStreaming: false,
      }));

      // Create structured action plan from response
      await get().createActionPlanFromResponse(response.content, projectId);
    } catch (error) {
      set(state => ({
        messages: state.messages.map(m => 
          m.id === pendingMessage.id 
            ? { ...m, status: 'error', content: 'Failed to get response' }
            : m
        ),
        isStreaming: false,
        error: 'Failed to send message',
      }));
    }
  },

  fetchActionPlan: async (planId: string) => {
    try {
      const response = await devosApi.getActionPlan(planId);
      if (response.data) {
        set({ currentPlan: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch action plan:', error);
    }
  },

  approveEdit: (editId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step => ({
          ...step,
          fileChanges: step.fileChanges.map(change =>
            change.id === editId ? { ...change, status: 'completed' as ExecutionStatus } : change
          ),
        })),
      } : null,
    }));
  },

  rejectEdit: (editId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step => ({
          ...step,
          fileChanges: step.fileChanges.map(change =>
            change.id === editId ? { ...change, status: 'failed' as ExecutionStatus } : change
          ),
        })),
      } : null,
    }));
  },

  approveAllEdits: () => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step => ({
          ...step,
          fileChanges: step.fileChanges.map(change => ({ ...change, status: 'completed' as ExecutionStatus })),
        })),
      } : null,
    }));
  },

  applyChanges: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({ isProcessing: true });
    try {
      await devosApi.applyActionPlan(currentPlan.id);
      set(state => ({
        currentPlan: state.currentPlan ? {
          ...state.currentPlan,
          status: 'applied',
          appliedAt: new Date(),
        } : null,
        isProcessing: false,
      }));
    } catch (error) {
      set({ error: 'Failed to apply changes', isProcessing: false });
    }
  },

  rollbackChanges: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({ isProcessing: true });
    try {
      await devosApi.rollbackActionPlan(currentPlan.id);
      set(state => ({
        currentPlan: state.currentPlan ? {
          ...state.currentPlan,
          status: 'rolled_back',
        } : null,
        isProcessing: false,
      }));
    } catch (error) {
      set({ error: 'Failed to rollback changes', isProcessing: false });
    }
  },

  clearMessages: () => {
    set({ messages: [], currentPlan: null });
  },

  createActionPlanFromResponse: async (response: string, projectId: string) => {
    // Set planning status
    set({ isProcessing: true });
    
    try {
      // Call the API to get a structured action plan
      const planId = `plan_${Date.now()}`;
      await get().fetchActionPlan(planId);
      set({ isProcessing: false });
    } catch (error) {
      console.error('Failed to create action plan from response:', error);
      set({ error: 'Failed to create action plan', isProcessing: false });
    }
  },

  // New structured state management methods
  executeStep: async (stepId: string) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId 
            ? { ...step, status: 'running' as ExecutionStatus, startedAt: new Date() }
            : step
        ),
      } : null,
      isProcessing: true,
    }));

    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId 
            ? { ...step, status: 'completed' as ExecutionStatus, completedAt: new Date(), progress: 100 }
            : step
        ),
      } : null,
      isProcessing: false,
    }));
  },

  approveStep: (stepId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId ? { ...step, status: 'completed' as ExecutionStatus } : step
        ),
      } : null,
    }));
  },

  rejectStep: (stepId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId ? { ...step, status: 'failed' as ExecutionStatus } : step
        ),
      } : null,
    }));
  },

  approveFileChange: (stepId: string, fileChangeId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId 
            ? {
                ...step,
                fileChanges: step.fileChanges.map(change =>
                  change.id === fileChangeId 
                    ? { ...change, status: 'completed' as ExecutionStatus }
                    : change
                ),
              }
            : step
        ),
      } : null,
    }));
  },

  rejectFileChange: (stepId: string, fileChangeId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId 
            ? {
                ...step,
                fileChanges: step.fileChanges.map(change =>
                  change.id === fileChangeId 
                    ? { ...change, status: 'failed' as ExecutionStatus }
                    : change
                ),
              }
            : step
        ),
      } : null,
    }));
  },

  updateStepProgress: (stepId: string, progress: number) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        steps: state.currentPlan.steps.map(step =>
          step.id === stepId ? { ...step, progress } : step
        ),
      } : null,
    }));
  },

  executePlan: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({ isProcessing: true });
    
    // Execute steps in dependency order
    const steps = [...currentPlan.steps];
    for (const step of steps) {
      await get().executeStep(step.id);
    }

    set({ isProcessing: false });
  },

  rollbackPlan: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({ isProcessing: true });
    
    // Simulate rollback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        status: 'rolled_back',
        timeline: {
          ...state.currentPlan.timeline,
          rolledBackAt: new Date(),
        },
      } : null,
      isProcessing: false,
    }));
  },

  validatePlan: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return false;

    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  getPlanSummary: (): PlanSummary | null => {
    const { currentPlan } = get();
    if (!currentPlan) return null;

    const totalSteps = currentPlan.steps.length;
    const completedSteps = currentPlan.steps.filter(s => s.status === 'completed').length;
    const totalFileChanges = currentPlan.steps.reduce((acc, step) => acc + step.fileChanges.length, 0);
    const completedFileChanges = currentPlan.steps.reduce((acc, step) => 
      acc + step.fileChanges.filter(c => c.status === 'completed').length, 0);
    
    return {
      totalSteps,
      completedSteps,
      totalFileChanges,
      completedFileChanges,
      estimatedDuration: currentPlan.metadata.estimatedDuration,
      riskLevel: currentPlan.metadata.riskLevel,
      canRollback: currentPlan.rollback.isAvailable,
      requiresUserAction: currentPlan.steps.some(s => s.metadata.requiresUserConfirmation),
      failedSteps: currentPlan.steps.filter(s => s.status === 'failed').map(s => s.id),
      pendingSteps: currentPlan.steps.filter(s => s.status === 'pending').map(s => s.id),
    };
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const auditLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    set(state => ({
      auditLogs: [auditLog, ...state.auditLogs].slice(0, 1000), // Keep last 1000 logs
    }));
  },

  getAuditLogs: () => {
    return get().auditLogs;
  },

  clearAuditLogs: () => {
    set({ auditLogs: [] });
  },
}));
