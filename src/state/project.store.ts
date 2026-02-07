import { create } from 'zustand';
import { Project, FileNode, AuditLog } from '@/types';
import { devosApi } from '@/api/devos.api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  fileTree: FileNode[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  fetchFileTree: (projectId: string) => Promise<void>;
  fetchAuditLogs: (projectId: string) => Promise<void>;
  toggleFileNode: (nodeId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  fileTree: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await devosApi.getProjects();
      if (response.data) {
        set({ projects: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  selectProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await devosApi.getProject(projectId);
      if (response.data) {
        set({ currentProject: response.data, isLoading: false });
        // Also fetch file tree and audit logs
        get().fetchFileTree(projectId);
        get().fetchAuditLogs(projectId);
      }
    } catch (error) {
      set({ error: 'Failed to fetch project', isLoading: false });
    }
  },

  fetchFileTree: async (projectId: string) => {
    try {
      const response = await devosApi.getFileTree(projectId);
      if (response.data) {
        set({ fileTree: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    }
  },

  fetchAuditLogs: async (projectId: string) => {
    try {
      const response = await devosApi.getAuditLogs(projectId);
      if (response.data) {
        set({ auditLogs: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  },

  toggleFileNode: (nodeId: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    set({ fileTree: toggleNode(get().fileTree) });
  },
}));
