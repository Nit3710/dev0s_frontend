import { create } from 'zustand';
import { AIMessage, ActionPlan, CodeEdit } from '@/types';
import { devosApi } from '@/api/devos.api';

interface AIState {
  messages: AIMessage[];
  currentPlan: ActionPlan | null;
  isStreaming: boolean;
  isProcessing: boolean;
  error: string | null;

  sendMessage: (projectId: string, content: string) => Promise<void>;
  fetchActionPlan: (planId: string) => Promise<void>;
  approveEdit: (editId: string) => void;
  rejectEdit: (editId: string) => void;
  approveAllEdits: () => void;
  applyChanges: () => Promise<void>;
  rollbackChanges: () => Promise<void>;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  currentPlan: null,
  isStreaming: false,
  isProcessing: false,
  error: null,

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

      // Fetch action plan after response
      await get().fetchActionPlan('plan_' + Date.now());
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
        edits: state.currentPlan.edits.map(edit =>
          edit.id === editId ? { ...edit, status: 'approved' as const } : edit
        ),
      } : null,
    }));
  },

  rejectEdit: (editId: string) => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        edits: state.currentPlan.edits.map(edit =>
          edit.id === editId ? { ...edit, status: 'rejected' as const } : edit
        ),
      } : null,
    }));
  },

  approveAllEdits: () => {
    set(state => ({
      currentPlan: state.currentPlan ? {
        ...state.currentPlan,
        edits: state.currentPlan.edits.map(edit => ({ ...edit, status: 'approved' as const })),
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
}));
