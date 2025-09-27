import { Router } from 'express';
import { aiController } from './aiController';
import { validateRequest } from '../../middleware/validation';
import { generateDocumentSchema, generateDiagramSchema, improveDocumentSchema } from './aiSchemas';

const router = Router();

// AI document generation routes
router.post('/generate-document', validateRequest(generateDocumentSchema), aiController.generateDocument);
router.post('/improve-document', validateRequest(improveDocumentSchema), aiController.improveDocument);
router.post('/auto-complete', aiController.autoCompleteDocument);

// AI diagram generation routes
router.post('/generate-diagram', validateRequest(generateDiagramSchema), aiController.generateDiagram);
router.post('/text-to-diagram', aiController.textToDiagram);
router.post('/diagram-to-text', aiController.diagramToText);

// AI analysis routes
router.post('/analyze-document', aiController.analyzeDocument);
router.post('/extract-insights', aiController.extractInsights);
router.post('/suggest-tags', aiController.suggestTags);

// AI content optimization routes
router.post('/optimize-content', aiController.optimizeContent);
router.post('/check-grammar', aiController.checkGrammar);
router.post('/improve-readability', aiController.improveReadability);

export { router as aiRoutes };
