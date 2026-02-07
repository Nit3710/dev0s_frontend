// Project Types
export type ProjectStatus = 'indexed' | 'indexing' | 'error' | 'pending';

export interface Project {
  id: string;
  name: string;
  path: string;
  status: ProjectStatus;
  lastActivity: Date;
  fileCount: number;
  language: string;
  description?: string;
}

// File System Types
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
  size?: number;
  isExpanded?: boolean;
}

// AI Types
export type AIMessageRole = 'user' | 'assistant' | 'system';
export type AIMessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: Date;
  status: AIMessageStatus;
  actionPlan?: ActionPlan;
}

// Action Plan Types
export type ActionPlanStatus = 'planning' | 'pending' | 'approved' | 'applying' | 'applied' | 'rejected' | 'rolled_back';

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  status: ActionPlanStatus;
  edits: CodeEdit[];
  createdAt: Date;
  appliedAt?: Date;
}

// Code Edit Types
export type EditType = 'create' | 'modify' | 'delete' | 'rename';
export type EditStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface CodeEdit {
  id: string;
  filePath: string;
  type: EditType;
  status: EditStatus;
  diff: DiffChunk[];
  description?: string;
  newPath?: string; // For rename operations
}

// Diff Types
export type DiffLineType = 'context' | 'added' | 'removed';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffChunk {
  id: string;
  startLine: number;
  endLine: number;
  lines: DiffLine[];
  isApproved?: boolean;
}

// Audit Log Types
export type AuditAction = 'ai_response' | 'plan_created' | 'plan_approved' | 'plan_rejected' | 'changes_applied' | 'changes_rolled_back' | 'file_indexed' | 'error';
export type AuditStatus = 'success' | 'failed' | 'rolled_back' | 'pending';

export interface AuditLog {
  id: string;
  action: AuditAction;
  description: string;
  timestamp: Date;
  status: AuditStatus;
  projectId: string;
  filesAffected?: string[];
  metadata?: Record<string, unknown>;
}

// Settings Types
export type LLMProvider = 'openai' | 'anthropic' | 'local';

export interface Settings {
  llmProvider: LLMProvider;
  apiKey?: string;
  tokenUsage: {
    used: number;
    limit: number;
  };
  privacy: {
    sendCodeContext: boolean;
    anonymizeData: boolean;
  };
  ideConnection: {
    status: 'connected' | 'disconnected' | 'error';
    ideName?: string;
    version?: string;
  };
}

// Auth Types
export interface User {
  id: string;
  email?: string;
  workspaceToken: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
