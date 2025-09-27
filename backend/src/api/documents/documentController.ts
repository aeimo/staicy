import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { CreateDocumentRequest, UpdateDocumentRequest, GenerateDocumentRequest } from '../../types';
import { aiService } from '../../services/aiService';

const prisma = new PrismaClient();

export const documentController = {
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, type, status, search, page = 1, limit = 10 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Build where clause
      const where: any = {};

      // Filter by team access
      if (teamId) {
        const hasTeamAccess = req.user?.teams.some(member => member.teamId === teamId);
        if (!hasTeamAccess && req.user?.role !== 'ADMIN') {
          throw new AppError('Access denied to this team.', 403);
        }
        where.teamId = teamId;
      } else {
        // Show documents from user's teams
        const userTeamIds = req.user?.teams.map(member => member.teamId) || [];
        where.teamId = { in: userTeamIds };
      }

      if (type) where.type = type;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { path: '$', string_contains: search as string } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            author: {
              select: { id: true, name: true, email: true }
            },
            team: {
              select: { id: true, name: true }
            },
            _count: {
              select: {
                diagrams: true,
                comments: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.document.count({ where })
      ]);

      res.json({
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          team: {
            select: { id: true, name: true }
          },
          diagrams: {
            include: {
              creator: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, email: true }
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      res.json({ document });
    } catch (error) {
      next(error);
    }
  },

  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, type, teamId, tags }: CreateDocumentRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Verify team access
      const hasTeamAccess = req.user?.teams.some(member => member.teamId === teamId);
      if (!hasTeamAccess && req.user?.role !== 'ADMIN') {
        throw new AppError('Access denied to this team.', 403);
      }

      const document = await prisma.document.create({
        data: {
          title,
          content,
          type,
          teamId,
          authorId: userId,
          tags: tags || []
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.status(201).json({
        document,
        message: 'Document created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, type, status, tags }: UpdateDocumentRequest = req.body;

      const document = await prisma.document.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(type && { type }),
          ...(status && { status }),
          ...(tags && { tags }),
          version: { increment: 1 }
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.json({
        document,
        message: 'Document updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.document.delete({
        where: { id }
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getAISuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      const suggestions = await aiService.suggestImprovements(document);
      
      res.json({ suggestions });
    } catch (error) {
      next(error);
    }
  },

  async generateFromCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { codeContent, type, teamId }: GenerateDocumentRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Verify team access
      const hasTeamAccess = req.user?.teams.some(member => member.teamId === teamId);
      if (!hasTeamAccess && req.user?.role !== 'ADMIN') {
        throw new AppError('Access denied to this team.', 403);
      }

      const generatedContent = await aiService.generateDocumentFromCode(codeContent, type);
      
      const document = await prisma.document.create({
        data: {
          title: `Generated from Code - ${new Date().toLocaleDateString()}`,
          content: generatedContent,
          type,
          teamId,
          authorId: userId,
          tags: ['ai-generated', 'code-documentation']
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.status(201).json({
        document,
        message: 'Document generated from code successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async analyzeCodebase(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileContents, type = 'ARCHITECTURE' } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      if (!fileContents || !Array.isArray(fileContents)) {
        throw new AppError('File contents are required.', 400);
      }

      // Combine all file contents for analysis
      const combinedContent = fileContents.map(file => 
        `File: ${file.name}\nType: ${file.type}\nContent:\n${file.content}\n\n`
      ).join('---\n');

      // Generate documentation from the combined codebase
      const generatedContent = await aiService.generateDocumentFromCode(combinedContent, type);
      
      // Also generate a diagram representation
      const diagramPrompt = `Create an architecture diagram for this codebase with ${fileContents.length} files: ${fileContents.map(f => f.name).join(', ')}`;
      const diagramResult = await aiService.generateDrawIODiagram({
        prompt: diagramPrompt,
        type: 'ARCHITECTURE',
        context: 'Codebase Analysis'
      });

      res.status(201).json({
        documentation: generatedContent,
        diagram: diagramResult,
        fileCount: fileContents.length,
        message: 'Codebase analyzed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async improveWithAI(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { improvements } = req.body;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      const improvedContent = await aiService.improveDocument(document, improvements);
      
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          content: improvedContent,
          version: { increment: 1 }
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.json({
        document: updatedDocument,
        message: 'Document improved with AI successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      // Get team members who have access to this document
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: document.teamId },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });

      res.json({ collaborators: teamMembers });
    } catch (error) {
      next(error);
    }
  },

  async shareDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, role = 'VIEWER' } = req.body;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      // Add user to team if not already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: user.id,
            teamId: document.teamId
          }
        }
      });

      if (!existingMember) {
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: document.teamId,
            role: role as any
          }
        });
      }

      res.json({ message: 'Document shared successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      // For now, we'll return the current version
      // In a full implementation, you'd store version history
      res.json({
        versions: [{
          id: document.id,
          version: document.version,
          content: document.content,
          updatedAt: document.updatedAt,
          author: document.author
        }]
      });
    } catch (error) {
      next(error);
    }
  },

  async restoreVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, versionId } = req.params;
      const document = req.document;

      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      // For now, this is a placeholder
      // In a full implementation, you'd restore from version history
      res.json({ message: 'Version restored successfully' });
    } catch (error) {
      next(error);
    }
  }
};
