import { z } from 'zod';
import { DocType, DocStatus } from '@prisma/client';

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.any(), // Rich text content can be any JSON structure
    type: z.nativeEnum(DocType),
    teamId: z.string().min(1, 'Team ID is required'),
    tags: z.array(z.string()).optional()
  })
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    content: z.any().optional(),
    type: z.nativeEnum(DocType).optional(),
    status: z.nativeEnum(DocStatus).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const generateDocumentSchema = z.object({
  body: z.object({
    codeContent: z.string().min(1, 'Code content is required'),
    type: z.nativeEnum(DocType),
    teamId: z.string().min(1, 'Team ID is required'),
    context: z.string().optional()
  })
});

export const improveDocumentSchema = z.object({
  body: z.object({
    improvements: z.array(z.string()).min(1, 'At least one improvement is required')
  })
});

export const shareDocumentSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['VIEWER', 'CONTRIBUTOR', 'EDITOR']).optional()
  })
});
