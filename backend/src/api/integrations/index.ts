import { Router } from 'express';
import { integrationController } from './integrationController';
import { validateRequest } from '../../middleware/validation';
import { createIntegrationSchema, syncIntegrationSchema } from './integrationSchemas';

const router = Router();

// Integration management routes
router.get('/', integrationController.getIntegrations);
router.get('/:id', integrationController.getIntegration);
router.post('/', validateRequest(createIntegrationSchema), integrationController.createIntegration);
router.put('/:id', integrationController.updateIntegration);
router.delete('/:id', integrationController.deleteIntegration);

// GitHub integration routes
router.post('/github/sync', integrationController.syncWithGitHub);
router.post('/github/webhook', integrationController.handleGitHubWebhook);
router.get('/github/repositories', integrationController.getGitHubRepositories);

// Slack integration routes
router.post('/slack/webhook', integrationController.handleSlackWebhook);
router.post('/slack/command', integrationController.handleSlackCommand);
router.post('/slack/notify', integrationController.sendSlackNotification);

// Confluence integration routes
router.post('/confluence/sync', integrationController.syncWithConfluence);
router.get('/confluence/spaces', integrationController.getConfluenceSpaces);
router.post('/confluence/export', integrationController.exportToConfluence);

// Jira integration routes
router.post('/jira/sync', integrationController.syncWithJira);
router.get('/jira/projects', integrationController.getJiraProjects);
router.post('/jira/generate-requirements', integrationController.generateRequirementsFromTickets);

// Notion integration routes
router.post('/notion/sync', integrationController.syncWithNotion);
router.post('/notion/export', integrationController.exportToNotion);

// Integration status and health
router.get('/:id/status', integrationController.getIntegrationStatus);
router.post('/:id/test', integrationController.testIntegration);

export { router as integrationRoutes };
