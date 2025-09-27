import { Socket } from 'socket.io';
import { DocumentChange, CursorPosition, CollaborationUser } from '../types';

interface DocumentSession {
  documentId: string;
  users: Map<string, CollaborationUser>;
  lastChange: number;
}

class CollaborationService {
  private documentSessions: Map<string, DocumentSession> = new Map();
  private userSessions: Map<string, string> = new Map(); // socketId -> documentId

  handleUserJoin(socket: Socket, documentId: string) {
    const userId = socket.handshake.auth?.userId;
    const userName = socket.handshake.auth?.userName;
    const userEmail = socket.handshake.auth?.userEmail;

    if (!userId || !userName || !userEmail) {
      socket.emit('error', { message: 'User information required' });
      return;
    }

    // Get or create document session
    let session = this.documentSessions.get(documentId);
    if (!session) {
      session = {
        documentId,
        users: new Map(),
        lastChange: Date.now()
      };
      this.documentSessions.set(documentId, session);
    }

    // Add user to session
    const user: CollaborationUser = {
      id: userId,
      name: userName,
      email: userEmail
    };

    session.users.set(userId, user);
    this.userSessions.set(socket.id, documentId);

    // Notify other users in the document
    socket.to(`document-${documentId}`).emit('user-joined', user);

    // Send current collaborators to the new user
    socket.emit('collaborators', Array.from(session.users.values()));

    console.log(`User ${userName} joined document ${documentId}`);
  }

  handleUserLeave(socket: Socket, documentId: string) {
    const userId = socket.handshake.auth?.userId;
    const session = this.documentSessions.get(documentId);

    if (session && userId) {
      session.users.delete(userId);
      
      // Notify other users
      socket.to(`document-${documentId}`).emit('user-left', { userId });

      // Clean up empty sessions
      if (session.users.size === 0) {
        this.documentSessions.delete(documentId);
      }
    }

    this.userSessions.delete(socket.id);
    console.log(`User left document ${documentId}`);
  }

  handleDocumentChange(socket: Socket, data: DocumentChange) {
    const { documentId, changes, version, userId } = data;
    const session = this.documentSessions.get(documentId);

    if (!session) {
      socket.emit('error', { message: 'Document session not found' });
      return;
    }

    // Update session timestamp
    session.lastChange = Date.now();

    // Broadcast changes to other users in the document
    socket.to(`document-${documentId}`).emit('document-change', {
      ...data,
      timestamp: Date.now()
    });

    console.log(`Document ${documentId} changed by user ${userId}`);
  }

  handleCursorPosition(socket: Socket, data: CursorPosition) {
    const { documentId, position, selection } = data;
    const userId = socket.handshake.auth?.userId;
    const session = this.documentSessions.get(documentId);

    if (!session || !userId) {
      return;
    }

    // Update user's cursor position
    const user = session.users.get(userId);
    if (user) {
      user.cursor = {
        position,
        selection
      };

      // Broadcast cursor position to other users
      socket.to(`document-${documentId}`).emit('cursor-position', {
        userId,
        position,
        selection,
        timestamp: Date.now()
      });
    }
  }

  handleUserDisconnect(socket: Socket) {
    const documentId = this.userSessions.get(socket.id);
    
    if (documentId) {
      this.handleUserLeave(socket, documentId);
    }

    console.log(`User disconnected: ${socket.id}`);
  }

  getDocumentCollaborators(documentId: string): CollaborationUser[] {
    const session = this.documentSessions.get(documentId);
    return session ? Array.from(session.users.values()) : [];
  }

  getActiveDocuments(): string[] {
    return Array.from(this.documentSessions.keys());
  }

  getDocumentSessionInfo(documentId: string) {
    const session = this.documentSessions.get(documentId);
    if (!session) {
      return null;
    }

    return {
      documentId,
      userCount: session.users.size,
      users: Array.from(session.users.values()),
      lastChange: session.lastChange
    };
  }
}

export const collaborationService = new CollaborationService();
