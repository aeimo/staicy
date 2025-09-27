import { Router } from 'express';
import { diagramController } from './diagramController';
import { validateRequest } from '../../middleware/validation';
import { createDiagramSchema, updateDiagramSchema, generateDiagramSchema, generateDrawIOSchema, refineDiagramSchema, imageToDiagramSchema } from './diagramSchemas';

const router = Router();

// Diagram CRUD routes
router.get('/', diagramController.getDiagrams);
router.get('/:id', diagramController.getDiagram);
router.post('/', validateRequest(createDiagramSchema), diagramController.createDiagram);
router.put('/:id', validateRequest(updateDiagramSchema), diagramController.updateDiagram);
router.delete('/:id', diagramController.deleteDiagram);

// AI diagram generation routes
router.post('/generate', validateRequest(generateDiagramSchema), diagramController.generateDiagram);
router.post('/text-to-diagram', diagramController.textToDiagram);
router.post('/diagram-to-text', diagramController.diagramToText);

// Advanced Draw.io generation routes
router.post('/generate-drawio', validateRequest(generateDrawIOSchema), diagramController.generateDrawIODiagram);
router.post('/refine-diagram', validateRequest(refineDiagramSchema), diagramController.refineDiagram);
router.post('/image-to-diagram', validateRequest(imageToDiagramSchema), diagramController.generateDiagramFromImage);

// Specialized diagram generation routes
router.post('/generate-infrastructure', diagramController.generateInfrastructureDiagram);
router.post('/generate-process-flow', diagramController.generateProcessFlowchart);
router.post('/generate-sequence', diagramController.generateSequenceDiagram);
router.post('/generate-network', diagramController.generateNetworkDiagram);

// Advanced diagram operations
router.post('/analyze', diagramController.analyzeDiagram);
router.post('/optimize', diagramController.optimizeDiagram);
router.post('/convert-format', diagramController.convertDiagramFormat);

// Diagram conversion routes
router.post('/:id/convert-to-drawio', diagramController.convertToDrawIO);
router.post('/:id/sync-drawio', diagramController.syncWithDrawIO);
router.post('/:id/validate', diagramController.validateDiagram);

// Export routes
router.get('/:id/export/:format', diagramController.exportDiagram);

export { router as diagramRoutes };
