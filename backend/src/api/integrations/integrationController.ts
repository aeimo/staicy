import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { integrationService } from '../../services/integrationService';

const prisma = new PrismaClient();

export const integrationController = {
  async getIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, type, isActive } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Build where clause
      const where: any = {};

      if (teamId) {
        const hasTeamAccess = req.user?.teams.some(member => member.teamId === teamId);
        if (!hasTeamAccess && req.user?.role !== 'ADMIN') {
          throw new AppError('Access denied to this team.', 403);
        }
        where.teamId = teamId;
      } else {
        // Show integrations from user's teams
        const userTeamIds = req.user?.teams.map(member => member.teamId) || [];
        where.teamId = { in: userTeamIds };
      }

      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const integrations = await prisma.integration.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ integrations });
    } catch (error) {
      next(error);
    }
  },

  async getIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const integration = await prisma.integration.findUnique({
        where: { id },
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      if (!integration) {
        throw new AppError('Integration not found.', 404);
      }

      res.json({ integration });
    } catch (error) {
      next(error);
    }
  },

  async createIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, name, config, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      // Verify team access
      const hasTeamAccess = req.user?.teams.some(member => member.teamId === teamId);
      if (!hasTeamAccess && req.user?.role !== 'ADMIN') {
        throw new AppError('Access denied to this team.', 403);
      }

      const integration = await prisma.integration.create({
        data: {
          type,
          name,
          config,
          teamId
        },
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.status(201).json({
        integration,
        message: 'Integration created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, config, isActive } = req.body;

      const integration = await prisma.integration.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(config && { config }),
          ...(isActive !== undefined && { isActive })
        },
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      res.json({
        integration,
        message: 'Integration updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.integration.delete({
        where: { id }
      });

      res.json({ message: 'Integration deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async syncWithGitHub(req: Request, res: Response, next: NextFunction) {
    try {
      const { repository, branch, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.syncWithGitHub(repository, branch, teamId);

      res.json({
        result,
        message: 'GitHub sync completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async handleGitHubWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await integrationService.handleGitHubWebhook(req.body);

      res.json({
        result,
        message: 'GitHub webhook processed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getGitHubRepositories(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const repositories = await integrationService.getGitHubRepositories(teamId as string);

      res.json({ repositories });
    } catch (error) {
      next(error);
    }
  },

  async handleSlackWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await integrationService.handleSlackWebhook(req.body);

      res.json({
        result,
        message: 'Slack webhook processed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async handleSlackCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await integrationService.handleSlackCommand(req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async sendSlackNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { channelId, message, documentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      await integrationService.sendSlackNotification(channelId, message, documentId);

      res.json({ message: 'Slack notification sent successfully' });
    } catch (error) {
      next(error);
    }
  },

  async syncWithConfluence(req: Request, res: Response, next: NextFunction) {
    try {
      const { spaceKey, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.syncWithConfluence(spaceKey, teamId);

      res.json({
        result,
        message: 'Confluence sync completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getConfluenceSpaces(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const spaces = await integrationService.getConfluenceSpaces(teamId as string);

      res.json({ spaces });
    } catch (error) {
      next(error);
    }
  },

  async exportToConfluence(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, spaceKey, pageTitle } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.exportToConfluence(documentId, spaceKey, pageTitle);

      res.json({
        result,
        message: 'Document exported to Confluence successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async syncWithJira(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectKey, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.syncWithJira(projectKey, teamId);

      res.json({
        result,
        message: 'Jira sync completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getJiraProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const projects = await integrationService.getJiraProjects(teamId as string);

      res.json({ projects });
    } catch (error) {
      next(error);
    }
  },

  async generateRequirementsFromTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketIds, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const document = await integrationService.generateRequirementsFromTickets(ticketIds, teamId);

      res.json({
        document,
        message: 'Requirements document generated from Jira tickets successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async syncWithNotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { databaseId, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.syncWithNotion(databaseId, teamId);

      res.json({
        result,
        message: 'Notion sync completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async exportToNotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, pageId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated.', 401);
      }

      const result = await integrationService.exportToNotion(documentId, pageId);

      res.json({
        result,
        message: 'Document exported to Notion successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getIntegrationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const status = await integrationService.getIntegrationStatus(id);

      res.json({ status });
    } catch (error) {
      next(error);
    }
  },

  async testIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await integrationService.testIntegration(id);

      res.json({
        result,
        message: 'Integration test completed'
      });
    } catch (error) {
      next(error);
    }
  }
};
