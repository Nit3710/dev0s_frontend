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

// Enhanced Action Plan State Model
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'rollback_pending' | 'rollback_running' | 'rollback_completed';
export type StepType = 'analysis' | 'planning' | 'validation' | 'backup' | 'file_operation' | 'test' | 'cleanup';
export type FileOperationType = 'create' | 'modify' | 'delete' | 'rename' | 'copy' | 'move';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface PlanStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  status: ExecutionStatus;
  priority: Priority;
  dependencies: string[]; // Step IDs that must complete first
  fileChanges: FileChange[];
  metadata: {
    estimatedDuration?: number; // in seconds
    riskLevel: 'low' | 'medium' | 'high';
    requiresUserConfirmation: boolean;
    canRollback: boolean;
  };
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  progress?: number; // 0-100
}

export interface FileChange {
  id: string;
  operation: FileOperationType;
  filePath: string;
  newPath?: string; // For rename/move operations
  status: ExecutionStatus;
  backupPath?: string;
  checksum?: string; // For integrity verification
  diff: DiffChunk[];
  metadata: {
    size: number;
    linesAdded: number;
    linesRemoved: number;
    fileType: string;
    encoding?: string;
  };
  appliedAt?: Date;
  rollbackAt?: Date;
  errorMessage?: string;
}

export interface PlanSummary {
  totalSteps: number;
  completedSteps: number;
  totalFileChanges: number;
  completedFileChanges: number;
  estimatedDuration: number;
  actualDuration?: number;
  riskLevel: 'low' | 'medium' | 'high';
  canRollback: boolean;
  requiresUserAction: boolean;
  failedSteps: string[];
  pendingSteps: string[];
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  status: ActionPlanStatus;
  priority: Priority;
  steps: PlanStep[];
  metadata: {
    totalFiles: number;
    estimatedDuration: number; // in seconds
    riskLevel: 'low' | 'medium' | 'high';
    requiresGit: boolean;
    requiresBuild: boolean;
    requiresTest: boolean;
  };
  timeline: {
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    appliedAt?: Date;
    rolledBackAt?: Date;
  };
  rollback: {
    isAvailable: boolean;
    rollbackPlan?: ActionPlan; // Nested plan for rollback
    rollbackPoint?: string; // Git commit hash or backup identifier
  };
  validation: {
    preConditions: string[];
    postConditions: string[];
    tests: string[];
  };
  error?: {
    code: string;
    message: string;
    stepId?: string;
    fileChangeId?: string;
  };
}

// Legacy types for backward compatibility
export type ActionPlanStatus = 'planning' | 'pending' | 'approved' | 'applying' | 'applied' | 'rejected' | 'rolled_back';
export type EditType = 'create' | 'modify' | 'delete' | 'rename';
export type EditStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface CodeEdit {
  id: string;
  filePath: string;
  type: EditType;
  status: EditStatus;
  diff: DiffChunk[];
  description?: string;
  newPath?: string;
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
export type AuditAction = 
  | 'ai_response' 
  | 'plan_created' 
  | 'plan_approved' 
  | 'plan_rejected' 
  | 'plan_executed'
  | 'plan_rolled_back'
  | 'file_approved'
  | 'file_rejected'
  | 'file_applied'
  | 'file_rollback'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'changes_applied'
  | 'changes_rolled_back'
  | 'file_indexed'
  | 'error'
  | 'validation_failed'
  | 'backup_created'
  | 'backup_restored';

export type AuditStatus = 'success' | 'failed' | 'rolled_back' | 'pending' | 'running';

export interface AuditLog {
  id: string;
  action: AuditAction;
  description: string;
  timestamp: Date;
  status: AuditStatus;
  projectId: string;
  filesAffected?: string[];
  stepId?: string;
  fileChangeId?: string;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
  duration?: number; // in milliseconds
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
