export interface DiagramLog {
  id: string;
  type: string;
  description: string;
  xmlContent: string;
  metadata: {
    elementCount: number;
    isValid: boolean;
    errors: string[];
    generationTime: number;
    model: string;
  };
  userId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagramSession {
  sessionId: string;
  userId?: string;
  diagrams: DiagramLog[];
  createdAt: Date;
  lastActivity: Date;
}

/**
 * In-memory storage for diagram logs (for development/demo purposes)
 * In production, this would be replaced with a proper database
 */
class DiagramStorage {
  private diagrams: Map<string, DiagramLog> = new Map();
  private sessions: Map<string, DiagramSession> = new Map();

  /**
   * Save a diagram log
   */
  async saveDiagram(diagram: Omit<DiagramLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiagramLog> {
    const id = this.generateId();
    const now = new Date();
    
    const diagramLog: DiagramLog = {
      ...diagram,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.diagrams.set(id, diagramLog);

    // Update session if provided
    if (diagram.sessionId) {
      await this.updateSession(diagram.sessionId, diagramLog);
    }

    return diagramLog;
  }

  /**
   * Get a diagram by ID
   */
  async getDiagram(id: string): Promise<DiagramLog | null> {
    return this.diagrams.get(id) || null;
  }

  /**
   * Get diagrams by user ID
   */
  async getDiagramsByUser(userId: string): Promise<DiagramLog[]> {
    return Array.from(this.diagrams.values()).filter(d => d.userId === userId);
  }

  /**
   * Get diagrams by session ID
   */
  async getDiagramsBySession(sessionId: string): Promise<DiagramLog[]> {
    return Array.from(this.diagrams.values()).filter(d => d.sessionId === sessionId);
  }

  /**
   * Search diagrams by type or description
   */
  async searchDiagrams(query: { type?: string; description?: string; userId?: string }): Promise<DiagramLog[]> {
    return Array.from(this.diagrams.values()).filter(diagram => {
      let matches = true;

      if (query.type && diagram.type !== query.type) {
        matches = false;
      }

      if (query.description && !diagram.description.toLowerCase().includes(query.description.toLowerCase())) {
        matches = false;
      }

      if (query.userId && diagram.userId !== query.userId) {
        matches = false;
      }

      return matches;
    });
  }

  /**
   * Update session with new diagram
   */
  private async updateSession(sessionId: string, diagram: DiagramLog): Promise<void> {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        userId: diagram.userId,
        diagrams: [],
        createdAt: new Date(),
        lastActivity: new Date()
      };
    }

    session.diagrams.push(diagram);
    session.lastActivity = new Date();
    
    this.sessions.set(sessionId, session);
  }

  /**
   * Get session information
   */
  async getSession(sessionId: string): Promise<DiagramSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions for a user
   */
  async getSessionsByUser(userId: string): Promise<DiagramSession[]> {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalDiagrams: number;
    diagramsByType: Record<string, number>;
    totalSessions: number;
    averageDiagramsPerSession: number;
  }> {
    const diagrams = Array.from(this.diagrams.values());
    const sessions = Array.from(this.sessions.values());

    const diagramsByType: Record<string, number> = {};
    diagrams.forEach(diagram => {
      diagramsByType[diagram.type] = (diagramsByType[diagram.type] || 0) + 1;
    });

    return {
      totalDiagrams: diagrams.length,
      diagramsByType,
      totalSessions: sessions.length,
      averageDiagramsPerSession: sessions.length > 0 ? diagrams.length / sessions.length : 0
    };
  }

  /**
   * Clean up old sessions (older than specified days)
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let removedCount = 0;

    // Remove old sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < cutoffDate) {
        this.sessions.delete(sessionId);
        removedCount++;
      }
    }

    // Remove diagrams without sessions
    for (const [diagramId, diagram] of this.diagrams.entries()) {
      if (diagram.sessionId && !this.sessions.has(diagram.sessionId)) {
        this.diagrams.delete(diagramId);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Singleton instance
export const diagramStorage = new DiagramStorage();

export default DiagramStorage;