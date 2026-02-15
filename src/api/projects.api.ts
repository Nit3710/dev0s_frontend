import { apiClient } from './client';
import { Project } from '@/types';

export interface ProjectResponse {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  repositoryUrl?: string;
  localPath: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isIndexed: boolean;
  lastIndexedAt?: string;
  gitBranch?: string;
  gitCommitHash?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  repositoryUrl?: string;
  localPath?: string;
}

export interface PaginatedProjectsResponse {
  content: ProjectResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const projectsApi = {
  // Get all projects for current user
  async getProjects(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedProjectsResponse> {
    const response = await apiClient.get<PaginatedProjectsResponse>(`/projects?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response;
  },

  // Get single project by ID
  async getProject(id: string): Promise<ProjectResponse> {
    const response = await apiClient.get<ProjectResponse>(`/projects/${id}`);
    return response;
  },

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<ProjectResponse> {
    const response = await apiClient.post<ProjectResponse>('/projects', projectData);
    return response;
  },

  // Update project
  async updateProject(id: string, projectData: Partial<Project>): Promise<ProjectResponse> {
    const response = await apiClient.put<ProjectResponse>(`/projects/${id}`, projectData);
    return response;
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  // Get file tree for project
  async getFileTree(id: string, includeContent = false): Promise<any> {
    const response = await apiClient.get(`/projects/${id}/file-tree?includeContent=${includeContent}`);
    return response;
  },

  // Index project files
  async indexProject(id: string): Promise<void> {
    await apiClient.post(`/projects/${id}/index`);
  },

  // Search projects
  async searchProjects(query: string): Promise<ProjectResponse[]> {
    const response = await apiClient.get<ProjectResponse[]>(`/projects/search?query=${encodeURIComponent(query)}`);
    return response;
  }
};
