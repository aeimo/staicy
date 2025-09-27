import { Router } from 'express';
import { documentController } from './documentController';
import { validateRequest } from '../../middleware/validation';
import { createDocumentSchema, updateDocumentSchema } from './documentSchemas';
import { requireDocumentAccess } from '../../middleware/auth';

const router = Router();

// Document CRUD routes
router.get('/', documentController.getDocuments);
router.get('/:id', requireDocumentAccess, documentController.getDocument);
router.post('/', validateRequest(createDocumentSchema), documentController.createDocument);
router.put('/:id', requireDocumentAccess, validateRequest(updateDocumentSchema), documentController.updateDocument);
router.delete('/:id', requireDocumentAccess, documentController.deleteDocument);

// AI-specific routes
router.post('/:id/ai/suggestions', requireDocumentAccess, documentController.getAISuggestions);
router.post('/generate-from-code', documentController.generateFromCode);
router.post('/:id/ai/improve', requireDocumentAccess, documentController.improveWithAI);

// Collaboration routes
router.get('/:id/collaborators', requireDocumentAccess, documentController.getCollaborators);
router.post('/:id/share', requireDocumentAccess, documentController.shareDocument);

// Version control routes
router.get('/:id/versions', requireDocumentAccess, documentController.getVersions);
router.post('/:id/versions/:versionId/restore', requireDocumentAccess, documentController.restoreVersion);

export { router as documentRoutes };
