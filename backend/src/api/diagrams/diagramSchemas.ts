import { z } from 'zod';
import { DiagramType } from '@prisma/client';

export const createDiagramSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.nativeEnum(DiagramType),
    content: z.any(), // Diagram content can be any JSON structure
    documentId: z.string().optional()
  })
});

export const updateDiagramSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    content: z.any().optional()
  })
});

export const generateDiagramSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.nativeEnum(DiagramType),
    documentId: z.string().optional()
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
    content: z.any().refine(val => val !== null && val !== undefined, 'Content is required')
  })
});

export const syncDrawIOSchema = z.object({
  body: z.object({
    drawIOContent: z.string().min(1, 'Draw.io content is required')
  })
});

export const exportDiagramSchema = z.object({
  params: z.object({
    format: z.enum(['png', 'svg', 'pdf', 'json'])
  })
});

export const generateDrawIOSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.nativeEnum(DiagramType),
    context: z.string().optional()
  })
});

export const refineDiagramSchema = z.object({
  body: z.object({
    existingXML: z.string().min(1, 'Existing XML is required'),
    refinementPrompt: z.string().min(1, 'Refinement prompt is required')
  })
});

export const imageToDiagramSchema = z.object({
  body: z.object({
    imageUrl: z.string().url('Valid image URL is required'),
    type: z.nativeEnum(DiagramType)
  })
});
