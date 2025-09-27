import { User, Team, Document, Diagram, Comment, Role, DocType, DocStatus, DiagramType, IntegrationType } from '@prisma/client';

// Extended types with relations
export interface UserWithTeams extends User {
  teams: TeamMember[];
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  documents: Document[];
}

export interface DocumentWithRelations extends Document {
  author: User;
  team: Team;
  diagrams: Diagram[];
  comments: Comment[];
}

export interface DiagramWithRelations extends Diagram {
  creator: User;
  document?: Document;
}

export interface CommentWithReplies extends Comment {
  author: User;
  replies: Comment[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  user: User;
  team: Team;
}

// API Request/Response types
export interface CreateDocumentRequest {
  title: string;
  content: any;
  type: DocType;
  teamId: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: any;
  type?: DocType;
  status?: DocStatus;
  tags?: string[];
}

export interface CreateDiagramRequest {
  title: string;
  type: DiagramType;
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

// AI Service types
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

export interface DocumentContext {
  documentId: string;
  teamId: string;
  documentType: DocType;
  existingContent: any;
  metadata?: any;
}

export interface GenerateDocumentRequest {
  prompt: string;
  type: DocType;
  teamId: string;
  context?: string;
}

export interface GenerateDiagramRequest {
  prompt: string;
  type: DiagramType;
  documentId?: string;
}

// Collaboration types
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

// Integration types
export interface GitHubIntegration {
  repository: string;
  branch: string;
  webhookSecret: string;
}

export interface SlackIntegration {
  channelId: string;
  botToken: string;
  signingSecret: string;
}

export interface ConfluenceIntegration {
  baseUrl: string;
  username: string;
  apiToken: string;
  spaceKey: string;
}

export interface JiraIntegration {
  baseUrl: string;
  username: string;
  apiToken: string;
  projectKey: string;
}

// Error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Re-export Prisma types
export {
  User,
  Team,
  Document,
  Diagram,
  Comment,
  Role,
  DocType,
  DocStatus,
  DiagramType,
  IntegrationType
};
