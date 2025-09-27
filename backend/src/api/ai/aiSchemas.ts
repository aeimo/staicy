import { z } from 'zod';
import { DocType, DiagramType } from '@prisma/client';

export const generateDocumentSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.nativeEnum(DocType),
    teamId: z.string().min(1, 'Team ID is required'),
    context: z.string().optional()
  })
});

export const improveDocumentSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    improvements: z.array(z.string()).min(1, 'At least one improvement is required')
  })
});

export const generateDiagramSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.nativeEnum(DiagramType)
  })
});

export const textToDiagramSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text is required'),
    type: z.nativeEnum(DiagramType)
  })
});

export const diagramToTextSchema = z.object({
  body: z.object({
    diagramContent: z.any().refine(val => val !== null && val !== undefined, 'Diagram content is required')
  })
});

export const analyzeDocumentSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'Document ID is required')
  })
});

export const extractInsightsSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'Document ID is required')
  })
});

export const suggestTagsSchema = z.object({
  body: z.object({
    content: z.any().refine(val => val !== null && val !== undefined, 'Content is required'),
    type: z.nativeEnum(DocType).optional()
  })
});

export const optimizeContentSchema = z.object({
  body: z.object({
    content: z.any().refine(val => val !== null && val !== undefined, 'Content is required'),
    optimizationType: z.enum(['seo', 'readability', 'structure', 'completeness']).optional()
  })
});

export const checkGrammarSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required')
  })
});

export const improveReadabilitySchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required')
  })
});
