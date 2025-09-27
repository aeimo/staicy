import { z } from 'zod';
import { IntegrationType } from '@prisma/client';

export const createIntegrationSchema = z.object({
  body: z.object({
    type: z.nativeEnum(IntegrationType),
    name: z.string().min(1, 'Name is required'),
    config: z.any(), // Integration configuration can be any JSON structure
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const updateIntegrationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    config: z.any().optional(),
    isActive: z.boolean().optional()
  })
});

export const syncIntegrationSchema = z.object({
  body: z.object({
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const githubSyncSchema = z.object({
  body: z.object({
    repository: z.string().min(1, 'Repository is required'),
    branch: z.string().min(1, 'Branch is required'),
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const slackWebhookSchema = z.object({
  body: z.object({
    token: z.string().optional(),
    team_id: z.string().optional(),
    team_domain: z.string().optional(),
    channel_id: z.string().optional(),
    channel_name: z.string().optional(),
    user_id: z.string().optional(),
    user_name: z.string().optional(),
    command: z.string().optional(),
    text: z.string().optional(),
    response_url: z.string().optional()
  })
});

export const confluenceSyncSchema = z.object({
  body: z.object({
    spaceKey: z.string().min(1, 'Space key is required'),
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const jiraSyncSchema = z.object({
  body: z.object({
    projectKey: z.string().min(1, 'Project key is required'),
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const notionSyncSchema = z.object({
  body: z.object({
    databaseId: z.string().min(1, 'Database ID is required'),
    teamId: z.string().min(1, 'Team ID is required')
  })
});

export const exportDocumentSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    targetId: z.string().min(1, 'Target ID is required'),
    title: z.string().optional()
  })
});
