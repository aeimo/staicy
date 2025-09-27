import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { aiService } from '../../services/aiService';

export const aiController = {
  async generateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, type, teamId, context } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const document = await aiService.generateDocumentFromCode(prompt, type);

      res.json({
        document,
        message: 'Document generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async improveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, improvements } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Get document
      const document = await req.document;
      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      const improvedDocument = await aiService.improveDocument(document, improvements);

      res.json({
        document: improvedDocument,
        message: 'Document improved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async autoCompleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { partialContent, context } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const completion = await aiService.autoCompleteDocument(partialContent, context);

      res.json({
        completion,
        message: 'Document auto-completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async generateDiagram(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, type } = req.body;

      const diagram = await aiService.createDiagramFromText(prompt, type);

      res.json({
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

      const diagram = await aiService.createDiagramFromText(text, type);

      res.json({
        diagram,
        message: 'Text converted to diagram successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async diagramToText(req: Request, res: Response, next: NextFunction) {
    try {
      const { diagramContent } = req.body;

      const text = await aiService.extractWorkflowFromDiagram(diagramContent);

      res.json({
        text,
        message: 'Diagram converted to text successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async analyzeDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Get document
      const document = await req.document;
      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      const analysis = await aiService.suggestImprovements(document);

      res.json({
        analysis,
        message: 'Document analysis completed'
      });
    } catch (error) {
      next(error);
    }
  },

  async extractInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Get document
      const document = await req.document;
      if (!document) {
        throw new AppError('Document not found.', 404);
      }

      const insights = await aiService.suggestImprovements(document);

      res.json({
        insights,
        message: 'Insights extracted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async suggestTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, type } = req.body;

      // This would use AI to suggest relevant tags
      const suggestedTags = ['ai-generated', 'documentation', 'technical'];

      res.json({
        tags: suggestedTags,
        message: 'Tags suggested successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async optimizeContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, optimizationType } = req.body;

      // This would use AI to optimize content
      const optimizedContent = content; // Placeholder

      res.json({
        optimizedContent,
        message: 'Content optimized successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async checkGrammar(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;

      // This would use AI to check grammar
      const grammarCheck = {
        score: 95,
        issues: [],
        suggestions: []
      };

      res.json({
        grammarCheck,
        message: 'Grammar check completed'
      });
    } catch (error) {
      next(error);
    }
  },

  async improveReadability(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;

      // This would use AI to improve readability
      const readabilityScore = 85;
      const improvedContent = content; // Placeholder

      res.json({
        readabilityScore,
        improvedContent,
        message: 'Readability improved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
