export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CONTRIBUTOR';
  teams: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  documents: Document[];
  settings?: TeamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CONTRIBUTOR';
  user: User;
  team: Team;
}

export interface TeamSettings {
  id: string;
  teamId: string;
  allowGuestAccess: boolean;
  requireApproval: boolean;
  aiAssistance: boolean;
  diagramGeneration: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: any; // Rich text content
  type: 'SPECIFICATION' | 'API_REFERENCE' | 'ARCHITECTURE' | 'PROCESS' | 'REQUIREMENTS' | 'GUIDE';
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';
  version: number;
  authorId: string;
  author: User;
  teamId: string;
  team: Team;
  diagrams: Diagram[];
  comments: Comment[];
  tags: string[];
  metadata?: any;
  aiSuggestions?: AISuggestion[];
  createdAt: string;
  updatedAt: string;
}

export interface Diagram {
  id: string;
  title: string;
  type: 'FLOWCHART' | 'SEQUENCE' | 'CLASS' | 'ER' | 'ARCHITECTURE' | 'NETWORK';
  content: any; // Mermaid/PlantUML code or draw.io XML
  documentId?: string;
  document?: Document;
  createdBy: string;
  creator: User;
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  documentId: string;
  document: Document;
  authorId: string;
  author: User;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  type: 'GITHUB' | 'SLACK' | 'CONFLUENCE' | 'NOTION' | 'JIRA' | 'DISCORD';
  name: string;
  config: any;
  teamId: string;
  team: Team;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISuggestion {
  id: string;
  type: 'improvement' | 'completion' | 'correction' | 'addition';
  content: string;
  confidence: number;
  position?: {
    start: number;
    end: number;
  };
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
}

export interface DocumentChange {
  documentId: string;
  changes: any[];
  version: number;
  userId: string;
  timestamp: number;
}

export interface CursorPosition {
  documentId: string;
  position: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateDocumentRequest {
  title: string;
  content: any;
  type: Document['type'];
  teamId: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: any;
  type?: Document['type'];
  status?: Document['status'];
  tags?: string[];
}

export interface CreateDiagramRequest {
  title: string;
  type: Diagram['type'];
  content: any;
  documentId?: string;
}

export interface UpdateDiagramRequest {
  title?: string;
  content?: any;
}

export interface CreateCommentRequest {
  content: string;
  documentId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface GenerateDocumentRequest {
  prompt: string;
  type: Document['type'];
  teamId: string;
  context?: string;
}

export interface GenerateDiagramRequest {
  prompt: string;
  type: Diagram['type'];
  documentId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CollaborationState {
  activeUsers: CollaborationUser[];
  currentUser: CollaborationUser | null;
  isConnected: boolean;
  documentId: string | null;
}
