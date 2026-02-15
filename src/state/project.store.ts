import { create } from 'zustand';
import { Project, FileNode, AuditLog } from '@/types';
import { projectsApi, ProjectResponse, CreateProjectRequest } from '@/api/projects.api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  fileTree: FileNode[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project>;
  selectProject: (projectId: string) => Promise<void>;
  fetchFileTree: (projectId: string) => Promise<void>;
  fetchAuditLogs: (projectId: string) => Promise<void>;
  toggleFileNode: (nodeId: string) => void;
}

// Helper function to map backend status to frontend status
function mapBackendStatus(
  backendStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
  isIndexed: boolean
): 'indexed' | 'indexing' | 'error' | 'pending' {
  if (backendStatus === 'ARCHIVED') return 'error';
  if (backendStatus === 'INACTIVE') return 'pending';
  return isIndexed ? 'indexed' : 'pending';
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
        path: project.localPath || project.repositoryUrl || '',
        status: mapBackendStatus(project.status, project.isIndexed),
        lastActivity: new Date(project.updatedAt),
        fileCount: 0, // TODO: Get from backend when available
        language: '', // TODO: Get from backend when available
        description: project.description || '',
      }));

      console.log('Setting projects:', projects);
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('fetchProjects error:', error);
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  createProject: async (projectData: CreateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.createProject(projectData);

      // Convert the created project to frontend format
      const newProject: Project = {
        id: response.id.toString(),
        name: response.name,
        path: response.localPath || response.repositoryUrl || '',
        status: mapBackendStatus(response.status, response.isIndexed),
        lastActivity: new Date(response.updatedAt),
        fileCount: 0,
        language: '',
        description: response.description || '',
      };

      // Refresh the projects list
      await get().fetchProjects();

      set({ isLoading: false });
      return newProject;
    } catch (error) {
      console.error('createProject error:', error);
      set({ error: 'Failed to create project', isLoading: false });
      throw error;
    }
  },

  selectProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProject(projectId);
      const project: Project = {
        id: response.id.toString(),
        name: response.name,
        path: response.localPath || response.repositoryUrl || '',
        status: mapBackendStatus(response.status, response.isIndexed),
        lastActivity: new Date(response.updatedAt),
        fileCount: 0,
        language: '',
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
