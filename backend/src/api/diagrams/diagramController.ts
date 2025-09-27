import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { CreateDiagramRequest, UpdateDiagramRequest, GenerateDiagramRequest } from '../../types';
import { aiService } from '../../services/aiService';
import { diagramService } from '../../services/diagramService';
import { advancedDiagramService } from '../../services/advancedDiagramService';

const prisma = new PrismaClient();

export const diagramController = {
  async getDiagrams(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, type, isGenerated, page = 1, limit = 10 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Build where clause
      const where: any = {};

      if (documentId) {
        where.documentId = documentId;
      }

      if (type) {
        where.type = type;
      }

      if (isGenerated !== undefined) {
        where.isGenerated = isGenerated === 'true';
      }

      // Filter by user's teams
      const userTeamIds = req.user?.teams.map(member => member.teamId) || [];
      const userDocuments = await prisma.document.findMany({
        where: { teamId: { in: userTeamIds } },
        select: { id: true }
      });

      const documentIds = userDocuments.map(doc => doc.id);
      where.OR = [
        { createdBy: userId },
        { documentId: { in: documentIds } }
      ];

      const skip = (Number(page) - 1) * Number(limit);

      const [diagrams, total] = await Promise.all([
        prisma.diagram.findMany({
          where,
          include: {
            creator: {
              select: { id: true, name: true, email: true }
            },
            document: {
              select: { id: true, title: true }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.diagram.count({ where })
      ]);

      res.json({
        diagrams,
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

  async getDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const diagram = await prisma.diagram.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          document: {
            select: { id: true, title: true }
          }
        }
      });

      if (!diagram) {
        throw new AppError('Diagram not found.', 404);
      }

      res.json({ diagram });
    } catch (error) {
      next(error);
    }
  },

  async createDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, type, content, documentId }: CreateDiagramRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Verify document access if documentId is provided
      if (documentId) {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
          include: { team: true }
        });

        if (!document) {
          throw new AppError('Document not found.', 404);
        }

        const hasAccess = req.user?.teams.some(member => member.teamId === document.teamId);
        if (!hasAccess && req.user?.role !== 'ADMIN') {
          throw new AppError('Access denied to this document.', 403);
        }
      }

      const diagram = await prisma.diagram.create({
        data: {
          title,
          type,
          content,
          documentId,
          createdBy: userId
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          document: {
            select: { id: true, title: true }
          }
        }
      });

      res.status(201).json({
        diagram,
        message: 'Diagram created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content }: UpdateDiagramRequest = req.body;

      const diagram = await prisma.diagram.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content })
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          document: {
            select: { id: true, title: true }
          }
        }
      });

      res.json({
        diagram,
        message: 'Diagram updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.diagram.delete({
        where: { id }
      });

      res.json({ message: 'Diagram deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async generateDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, type, documentId }: GenerateDiagramRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Generate diagram content using AI
      const generatedContent = await aiService.createDiagramFromText(prompt, type);

      // Create diagram record
      const diagram = await prisma.diagram.create({
        data: {
          title: `Generated: ${prompt.substring(0, 50)}...`,
          type,
          content: { mermaid: generatedContent },
          documentId,
          createdBy: userId,
          isGenerated: true
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          document: {
            select: { id: true, title: true }
          }
        }
      });

      res.status(201).json({
        diagram,
        message: 'Diagram generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async textToDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, type } = req.body;

      const diagramContent = await aiService.createDiagramFromText(text, type);

      res.json({
        content: diagramContent,
        message: 'Text converted to diagram successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async diagramToText(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;

      const text = await aiService.extractWorkflowFromDiagram(content);

      res.json({
        text,
        message: 'Diagram converted to text successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async convertToDrawIO(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const diagram = await prisma.diagram.findUnique({
        where: { id }
      });

      if (!diagram) {
        throw new AppError('Diagram not found.', 404);
      }

      const drawIOContent = await diagramService.convertToDrawIO(diagram.content);

      res.json({
        drawIOContent,
        message: 'Diagram converted to Draw.io format successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async syncWithDrawIO(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { drawIOContent } = req.body;

      const diagram = await prisma.diagram.findUnique({
        where: { id }
      });

      if (!diagram) {
        throw new AppError('Diagram not found.', 404);
      }

      await diagramService.syncWithDrawIO(id, drawIOContent);

      res.json({ message: 'Diagram synced with Draw.io successfully' });
    } catch (error) {
      next(error);
    }
  },

  async validateDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const diagram = await prisma.diagram.findUnique({
        where: { id }
      });

      if (!diagram) {
        throw new AppError('Diagram not found.', 404);
      }

      const validation = await diagramService.validateDiagram(diagram.content, diagram.type);

      res.json({
        validation,
        message: 'Diagram validation completed'
      });
    } catch (error) {
      next(error);
    }
  },

  async exportDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { format } = req.params;

      const diagram = await prisma.diagram.findUnique({
        where: { id }
      });

      if (!diagram) {
        throw new AppError('Diagram not found.', 404);
      }

      const exportData = await diagramService.exportDiagram(diagram.content, format);

      res.json({
        data: exportData,
        format,
        message: `Diagram exported as ${format} successfully`
      });
    } catch (error) {
      next(error);
    }
  },

  // Advanced Draw.io generation methods
  async generateDrawIODiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, type, context } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await aiService.generateDrawIODiagram({
        prompt,
        type,
        context
      });

      // Save the generated diagram
      const diagram = await prisma.diagram.create({
        data: {
          title: `AI Generated: ${prompt.substring(0, 50)}...`,
          type,
          content: { drawio: result.xml },
          createdBy: userId,
          isGenerated: true
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json({
        diagram,
        result,
        message: 'Draw.io diagram generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async refineDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { existingXML, refinementPrompt } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await aiService.refineDiagram(existingXML, refinementPrompt);

      res.json({
        result,
        message: 'Diagram refined successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async generateDiagramFromImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageUrl, type } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await aiService.generateDiagramFromImage(imageUrl, type);

      // Save the generated diagram
      const diagram = await prisma.diagram.create({
        data: {
          title: `From Image: ${new Date().toLocaleDateString()}`,
          type,
          content: { drawio: result.xml },
          createdBy: userId,
          isGenerated: true
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json({
        diagram,
        result,
        message: 'Diagram generated from image successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Specialized diagram generation methods
  async generateInfrastructureDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await advancedDiagramService.generateInfrastructureDiagram(description);

      res.json({
        result,
        message: 'Infrastructure diagram generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async generateProcessFlowchart(req: Request, res: Response, next: NextFunction) {
    try {
      const { processDescription } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await advancedDiagramService.generateProcessFlowchart(processDescription);

      res.json({
        result,
        message: 'Process flowchart generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async generateSequenceDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { interactionDescription } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await advancedDiagramService.generateSequenceDiagram(interactionDescription);

      res.json({
        result,
        message: 'Sequence diagram generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async generateNetworkDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { networkDescription } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await advancedDiagramService.generateNetworkDiagram(networkDescription);

      res.json({
        result,
        message: 'Network diagram generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Advanced diagram operations
  async analyzeDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { xml } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const analysis = await advancedDiagramService.analyzeDiagram(xml);

      res.json({
        analysis,
        message: 'Diagram analysis completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async optimizeDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { xml } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const optimizedXML = await advancedDiagramService.optimizeDiagram(xml);

      res.json({
        optimizedXML,
        message: 'Diagram optimized successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async convertDiagramFormat(req: Request, res: Response, next: NextFunction) {
    try {
      const { xml, targetFormat } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const convertedDiagram = await advancedDiagramService.convertDiagramFormat(xml, targetFormat);

      res.json({
        convertedDiagram,
        format: targetFormat,
        message: `Diagram converted to ${targetFormat} successfully`
      });
    } catch (error) {
      next(error);
    }
  }
};
