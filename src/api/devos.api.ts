import { 
  Project, 
  FileNode, 
  AIMessage, 
  ActionPlan, 
  AuditLog, 
  Settings,
  ApiResponse,
  PlanStep,
  FileChange,
  ExecutionStatus,
  Priority
} from '@/types';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'devos-frontend',
    path: '/home/user/projects/devos-frontend',
    status: 'indexed',
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    fileCount: 156,
    language: 'TypeScript',
    description: 'AI-powered developer operating system frontend',
  },
  {
    id: '2',
    name: 'api-gateway',
    path: '/home/user/projects/api-gateway',
    status: 'indexing',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    fileCount: 89,
    language: 'Java',
    description: 'Spring Boot API gateway service',
  },
  {
    id: '3',
    name: 'ml-pipeline',
    path: '/home/user/projects/ml-pipeline',
    status: 'error',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    fileCount: 234,
    language: 'Python',
    description: 'Machine learning data pipeline',
  },
  {
    id: '4',
    name: 'mobile-app',
    path: '/home/user/projects/mobile-app',
    status: 'pending',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    fileCount: 0,
    language: 'Kotlin',
    description: 'Android mobile application',
  },
];

const mockFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: '/src',
    type: 'directory',
    isExpanded: true,
    children: [
      {
        id: 'components',
        name: 'components',
        path: '/src/components',
        type: 'directory',
        children: [
          { id: 'Button.tsx', name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file', language: 'typescript' },
          { id: 'Card.tsx', name: 'Card.tsx', path: '/src/components/Card.tsx', type: 'file', language: 'typescript' },
          { id: 'Modal.tsx', name: 'Modal.tsx', path: '/src/components/Modal.tsx', type: 'file', language: 'typescript' },
        ],
      },
      {
        id: 'pages',
        name: 'pages',
        path: '/src/pages',
        type: 'directory',
        children: [
          { id: 'Home.tsx', name: 'Home.tsx', path: '/src/pages/Home.tsx', type: 'file', language: 'typescript' },
          { id: 'Dashboard.tsx', name: 'Dashboard.tsx', path: '/src/pages/Dashboard.tsx', type: 'file', language: 'typescript' },
        ],
      },
      {
        id: 'hooks',
        name: 'hooks',
        path: '/src/hooks',
        type: 'directory',
        children: [
          { id: 'useAuth.ts', name: 'useAuth.ts', path: '/src/hooks/useAuth.ts', type: 'file', language: 'typescript' },
          { id: 'useApi.ts', name: 'useApi.ts', path: '/src/hooks/useApi.ts', type: 'file', language: 'typescript' },
        ],
      },
      { id: 'App.tsx', name: 'App.tsx', path: '/src/App.tsx', type: 'file', language: 'typescript' },
      { id: 'main.tsx', name: 'main.tsx', path: '/src/main.tsx', type: 'file', language: 'typescript' },
    ],
  },
  { id: 'package.json', name: 'package.json', path: '/package.json', type: 'file', language: 'json' },
  { id: 'tsconfig.json', name: 'tsconfig.json', path: '/tsconfig.json', type: 'file', language: 'json' },
  { id: 'README.md', name: 'README.md', path: '/README.md', type: 'file', language: 'markdown' },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'plan_executed',
    description: 'Applied refactoring to Button component',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'success',
    projectId: '1',
    filesAffected: ['/src/components/Button.tsx', '/src/components/Button.test.tsx'],
    duration: 3500,
  },
  {
    id: '2',
    action: 'plan_approved',
    description: 'Approved action plan: Add error handling',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'success',
    projectId: '1',
  },
  {
    id: '3',
    action: 'ai_response',
    description: 'AI analyzed codebase and suggested improvements',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    status: 'success',
    projectId: '1',
  },
  {
    id: '4',
    action: 'plan_rolled_back',
    description: 'Rolled back changes to auth module',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'rolled_back',
    projectId: '1',
    filesAffected: ['/src/hooks/useAuth.ts'],
    duration: 2100,
  },
  {
    id: '5',
    action: 'error',
    description: 'Failed to apply changes: Merge conflict detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'failed',
    projectId: '1',
    filesAffected: ['/src/App.tsx'],
    error: {
      code: 'MERGE_CONFLICT',
      message: 'Merge conflict detected in App.tsx at line 15',
      stack: 'Error: Merge conflict\n    at FileOperation.apply (/app/src/operations.js:45:12)',
    },
  },
  {
    id: '6',
    action: 'file_approved',
    description: 'Approved file change: Button.tsx',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'success',
    projectId: '1',
    fileChangeId: 'fc1',
    filesAffected: ['/src/components/Button.tsx'],
  },
  {
    id: '7',
    action: 'step_failed',
    description: 'Step "Run Tests" failed: Test suite failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'failed',
    projectId: '1',
    stepId: 'step5',
    error: {
      code: 'TEST_FAILURE',
      message: '2 tests failed in Button.test.tsx',
    },
  },
  {
    id: '8',
    action: 'backup_created',
    description: 'Created backup before applying changes',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    status: 'success',
    projectId: '1',
    metadata: {
      backupPath: '/backups/backup_123456.tar.gz',
      filesCount: 5,
    },
  },
];

// DevOS API functions
export const devosApi = {
  // Auth
  async login(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    await delay(500);
    // Mock validation - accept any token starting with 'devos_'
    const valid = token.startsWith('devos_') || token.length > 10;
    return { data: { valid }, status: valid ? 200 : 401 };
  },

  // Projects
  async getProjects(): Promise<ApiResponse<Project[]>> {
    await delay(300);
    return { data: mockProjects, status: 200 };
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    await delay(200);
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return { error: 'Project not found', status: 404 };
    }
    return { data: project, status: 200 };
  },

  // File Tree
  async getFileTree(projectId: string): Promise<ApiResponse<FileNode[]>> {
    await delay(300);
    return { data: mockFileTree, status: 200 };
  },

  // AI Chat
  async sendMessage(projectId: string, message: string): Promise<AIMessage> {
    await delay(500);
    
    const responses = [
      "I've analyzed your request and identified the following changes needed. Let me create an action plan for you.",
      "Based on the codebase analysis, I recommend restructuring this component for better maintainability.",
      "I found 3 files that need to be modified to implement this feature. Here's my plan:",
      "I've identified a potential issue in your code. Let me suggest a fix with proper error handling.",
    ];

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      status: 'complete',
    };
  },

  // Action Plans
  async getActionPlan(planId: string): Promise<ApiResponse<ActionPlan>> {
    await delay(200);
    
    // Mock file changes
    const mockFileChanges: FileChange[] = [
      {
        id: 'fc1',
        operation: 'modify',
        filePath: '/src/components/Button.tsx',
        status: 'pending' as ExecutionStatus,
        diff: [
          {
            id: 'chunk1',
            startLine: 1,
            endLine: 20,
            lines: [
              { type: 'context', content: "import React from 'react';", oldLineNumber: 1, newLineNumber: 1 },
              { type: 'removed', content: "interface ButtonProps {", oldLineNumber: 2 },
              { type: 'removed', content: "  onClick: () => void;", oldLineNumber: 3 },
              { type: 'removed', content: "  children: React.ReactNode;", oldLineNumber: 4 },
              { type: 'removed', content: "}", oldLineNumber: 5 },
              { type: 'added', content: "interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {", newLineNumber: 2 },
              { type: 'added', content: "  variant?: 'primary' | 'secondary' | 'ghost';", newLineNumber: 3 },
              { type: 'added', content: "  size?: 'sm' | 'md' | 'lg';", newLineNumber: 4 },
              { type: 'added', content: "  isLoading?: boolean;", newLineNumber: 5 },
              { type: 'added', content: "}", newLineNumber: 6 },
              { type: 'context', content: "", oldLineNumber: 6, newLineNumber: 7 },
            ],
          },
        ],
        metadata: {
          size: 2048,
          linesAdded: 5,
          linesRemoved: 4,
          fileType: 'typescript',
          encoding: 'utf-8',
        },
      },
      {
        id: 'fc2',
        operation: 'create',
        filePath: '/src/components/Button.test.tsx',
        status: 'pending' as ExecutionStatus,
        diff: [
          {
            id: 'chunk2',
            startLine: 1,
            endLine: 15,
            lines: [
              { type: 'added', content: "import { render, screen, fireEvent } from '@testing-library/react';", newLineNumber: 1 },
              { type: 'added', content: "import { Button } from './Button';", newLineNumber: 2 },
              { type: 'added', content: "", newLineNumber: 3 },
              { type: 'added', content: "describe('Button', () => {", newLineNumber: 4 },
              { type: 'added', content: "  it('renders correctly', () => {", newLineNumber: 5 },
              { type: 'added', content: "    render(<Button>Click me</Button>);", newLineNumber: 6 },
              { type: 'added', content: "    expect(screen.getByText('Click me')).toBeInTheDocument();", newLineNumber: 7 },
              { type: 'added', content: "  });", newLineNumber: 8 },
              { type: 'added', content: "});", newLineNumber: 9 },
            ],
          },
        ],
        metadata: {
          size: 512,
          linesAdded: 9,
          linesRemoved: 0,
          fileType: 'typescript',
          encoding: 'utf-8',
        },
      },
    ];

    // Mock plan steps
    const mockSteps: PlanStep[] = [
      {
        id: 'step1',
        type: 'analysis',
        title: 'Analyze Current Button Implementation',
        description: 'Review existing Button component structure and dependencies',
        status: 'pending' as ExecutionStatus,
        priority: 'medium' as Priority,
        dependencies: [],
        fileChanges: [],
        metadata: {
          estimatedDuration: 30,
          riskLevel: 'low',
          requiresUserConfirmation: false,
          canRollback: true,
        },
      },
      {
        id: 'step2',
        type: 'backup',
        title: 'Create Backup',
        description: 'Create backup of current files before making changes',
        status: 'pending' as ExecutionStatus,
        priority: 'high' as Priority,
        dependencies: ['step1'],
        fileChanges: [],
        metadata: {
          estimatedDuration: 10,
          riskLevel: 'low',
          requiresUserConfirmation: false,
          canRollback: true,
        },
      },
      {
        id: 'step3',
        type: 'file_operation',
        title: 'Update Button Component',
        description: 'Refactor Button component with new variants and TypeScript types',
        status: 'pending' as ExecutionStatus,
        priority: 'high' as Priority,
        dependencies: ['step2'],
        fileChanges: [mockFileChanges[0]],
        metadata: {
          estimatedDuration: 60,
          riskLevel: 'medium',
          requiresUserConfirmation: true,
          canRollback: true,
        },
      },
      {
        id: 'step4',
        type: 'file_operation',
        title: 'Add Unit Tests',
        description: 'Create comprehensive unit tests for Button component',
        status: 'pending' as ExecutionStatus,
        priority: 'medium' as Priority,
        dependencies: ['step3'],
        fileChanges: [mockFileChanges[1]],
        metadata: {
          estimatedDuration: 45,
          riskLevel: 'low',
          requiresUserConfirmation: false,
          canRollback: true,
        },
      },
      {
        id: 'step5',
        type: 'test',
        title: 'Run Tests',
        description: 'Execute test suite to verify changes work correctly',
        status: 'pending' as ExecutionStatus,
        priority: 'high' as Priority,
        dependencies: ['step4'],
        fileChanges: [],
        metadata: {
          estimatedDuration: 30,
          riskLevel: 'low',
          requiresUserConfirmation: false,
          canRollback: false,
        },
      },
    ];

    const mockPlan: ActionPlan = {
      id: planId,
      title: 'Refactor Button Component',
      description: 'Add variants, improve accessibility, and add proper TypeScript types',
      status: 'pending',
      priority: 'medium',
      steps: mockSteps,
      metadata: {
        totalFiles: 2,
        estimatedDuration: 175, // 2 minutes 55 seconds
        riskLevel: 'medium',
        requiresGit: true,
        requiresBuild: false,
        requiresTest: true,
      },
      timeline: {
        createdAt: new Date(),
      },
      rollback: {
        isAvailable: true,
        rollbackPoint: 'abc123def456', // Mock git commit hash
      },
      validation: {
        preConditions: [
          'Git repository is clean',
          'All tests pass currently',
          'No conflicting changes',
        ],
        postConditions: [
          'Button component has new variants',
          'TypeScript types are improved',
          'All tests pass',
          'No breaking changes',
        ],
        tests: [
          'npm run test:unit',
          'npm run type-check',
          'npm run lint',
        ],
      },
    };
    return { data: mockPlan, status: 200 };
  },

  async approveActionPlan(planId: string): Promise<ApiResponse<ActionPlan>> {
    await delay(500);
    // Return a minimal approved plan structure
    return { 
      data: { 
        id: planId, 
        title: 'Refactor Button Component',
        description: 'Changes approved and ready to apply',
        status: 'approved',
        priority: 'medium',
        steps: [],
        metadata: {
          totalFiles: 0,
          estimatedDuration: 0,
          riskLevel: 'low',
          requiresGit: false,
          requiresBuild: false,
          requiresTest: false,
        },
        timeline: {
          createdAt: new Date(),
        },
        rollback: {
          isAvailable: false,
        },
        validation: {
          preConditions: [],
          postConditions: [],
          tests: [],
        },
      }, 
      status: 200 
    };
  },

  async applyActionPlan(planId: string): Promise<ApiResponse<ActionPlan>> {
    await delay(1000);
    // Return a minimal applied plan structure
    return { 
      data: { 
        id: planId,
        title: 'Refactor Button Component', 
        description: 'Changes applied successfully',
        status: 'applied',
        priority: 'medium',
        steps: [],
        metadata: {
          totalFiles: 0,
          estimatedDuration: 0,
          riskLevel: 'low',
          requiresGit: false,
          requiresBuild: false,
          requiresTest: false,
        },
        timeline: {
          createdAt: new Date(),
          appliedAt: new Date(),
        },
        rollback: {
          isAvailable: true,
        },
        validation: {
          preConditions: [],
          postConditions: [],
          tests: [],
        },
      }, 
      status: 200 
    };
  },

  async rollbackActionPlan(planId: string): Promise<ApiResponse<ActionPlan>> {
    await delay(800);
    // Return a minimal rolled back plan structure
    return { 
      data: { 
        id: planId,
        title: 'Refactor Button Component', 
        description: 'Changes rolled back',
        status: 'rolled_back',
        priority: 'medium',
        steps: [],
        metadata: {
          totalFiles: 0,
          estimatedDuration: 0,
          riskLevel: 'low',
          requiresGit: false,
          requiresBuild: false,
          requiresTest: false,
        },
        timeline: {
          createdAt: new Date(),
          rolledBackAt: new Date(),
        },
        rollback: {
          isAvailable: false,
        },
        validation: {
          preConditions: [],
          postConditions: [],
          tests: [],
        },
      }, 
      status: 200 
    };
  },

  // Audit Logs
  async getAuditLogs(projectId: string): Promise<ApiResponse<AuditLog[]>> {
    await delay(300);
    return { data: mockAuditLogs.filter(log => log.projectId === projectId || projectId === '1'), status: 200 };
  },

  // Settings
  async getSettings(): Promise<ApiResponse<Settings>> {
    await delay(200);
    return {
      data: {
        llmProvider: 'openai',
        tokenUsage: { used: 45230, limit: 100000 },
        privacy: { sendCodeContext: true, anonymizeData: false },
        ideConnection: { status: 'connected', ideName: 'VS Code', version: '1.85.0' },
      },
      status: 200,
    };
  },

  async updateSettings(settings: Partial<Settings>): Promise<ApiResponse<Settings>> {
    await delay(300);
    return {
      data: {
        llmProvider: settings.llmProvider || 'openai',
        tokenUsage: { used: 45230, limit: 100000 },
        privacy: settings.privacy || { sendCodeContext: true, anonymizeData: false },
        ideConnection: { status: 'connected', ideName: 'VS Code', version: '1.85.0' },
      },
      status: 200,
    };
  },
};
