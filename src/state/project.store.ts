import { create } from 'zustand';
import { Project, FileNode, AuditLog } from '@/types';
import { projectsApi, ProjectResponse } from '@/api/projects.api';

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
    console.log('fetchProjects called');
    set({ isLoading: true, error: null });
    try {
      console.log('Calling projectsApi.getProjects()...');
      const response = await projectsApi.getProjects();
      console.log('API response:', response);
      
      // Convert backend response to frontend format
      const projects: Project[] = response.content.map((project: ProjectResponse) => ({
        id: project.id.toString(),
        name: project.name,
        path: project.path,
        status: project.status,
        lastActivity: new Date(project.lastActivity),
        fileCount: project.fileCount,
        language: project.language,
        description: project.description || '',
      }));
      
      console.log('Setting projects:', projects);
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('fetchProjects error:', error);
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  selectProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProject(projectId);
      const project: Project = {
        id: response.id.toString(),
        name: response.name,
        path: response.path,
        status: response.status,
        lastActivity: new Date(response.lastActivity),
        fileCount: response.fileCount,
        language: response.language,
        description: response.description || '',
      };
      set({ currentProject: project, isLoading: false });
      // Also fetch file tree and audit logs
      get().fetchFileTree(projectId);
      get().fetchAuditLogs(projectId);
    } catch (error) {
      set({ error: 'Failed to fetch project', isLoading: false });
    }
  },

  fetchFileTree: async (projectId: string) => {
    try {
      const response = await projectsApi.getFileTree(projectId);
      if (response) {
        set({ fileTree: response });
      }
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    }
  },

  fetchAuditLogs: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // For now, use mock audit logs since this endpoint might not be implemented yet
      // TODO: Replace with real audit logs API when available
      const mockAuditLogs: AuditLog[] = [];
      set({ auditLogs: mockAuditLogs, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      set({ error: 'Failed to fetch audit logs', isLoading: false });
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
