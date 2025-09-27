import express from 'express';
import { googleDriveService } from '../googleDriveService';
import { XMLValidator } from '../utils/xmlValidator';

const router = express.Router();

/**
 * POST /api/drive/update-diagram
 * Update the Draw.io diagram on Google Drive with new XML content
 */
router.post('/update-diagram', async (req, res) => {
  try {
    const { xmlContent, createBackup = true, fileName, description } = req.body;

    // Validation
    if (!xmlContent) {
      return res.status(400).json({
        error: 'Missing XML content',
        message: 'xmlContent is required'
      });
    }

    console.log('Received request to update Google Drive diagram');

    // Validate XML before uploading
    const validation = await XMLValidator.validate(xmlContent);
    
    if (!validation.isValid && !validation.correctedXML) {
      return res.status(400).json({
        error: 'Invalid XML',
        message: 'XML content is not valid and could not be corrected',
        validationErrors: validation.errors
      });
    }

    const finalXML = validation.correctedXML || xmlContent;

    // Update the Google Drive file
    const updateResult = await googleDriveService.updateWithBackup({
      xmlContent: finalXML,
      fileName,
      description,
      createBackup
    });

    if (!updateResult.success) {
      return res.status(500).json({
        error: 'Drive update failed',
        message: updateResult.error || 'Failed to update Google Drive file'
      });
    }

    res.json({
      success: true,
      message: 'Diagram updated successfully on Google Drive',
      fileId: updateResult.fileId,
      webViewLink: updateResult.webViewLink,
      directEditLink: updateResult.directLink,
      backupId: updateResult.backupId,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        elementCount: validation.elementCount,
        wasCorrected: !!validation.correctedXML
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating Google Drive diagram:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/drive/file-info
 * Get information about the current Google Drive file
 */
router.get('/file-info', async (req, res) => {
  try {
    const fileInfo = await googleDriveService.getFileInfo();

    res.json({
      success: true,
      fileInfo,
      directEditLink: `https://app.diagrams.net/#G${fileInfo.id}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      error: 'Failed to get file info',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/drive/download-current
 * Download the current content of the Google Drive file
 */
router.get('/download-current', async (req, res) => {
  try {
    const content = await googleDriveService.downloadCurrentContent();

    res.json({
      success: true,
      xmlContent: content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error downloading current content:', error);
    res.status(500).json({
      error: 'Failed to download file',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/drive/create-backup
 * Create a backup of the current Google Drive file
 */
router.post('/create-backup', async (req, res) => {
  try {
    const backupId = await googleDriveService.createBackup();

    res.json({
      success: true,
      message: 'Backup created successfully',
      backupId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      error: 'Failed to create backup',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/drive/auth-url
 * Get Google OAuth2 authorization URL (for initial setup)
 */
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = googleDriveService.constructor.getAuthUrl();

    res.json({
      success: true,
      authUrl,
      message: 'Visit this URL to authorize the application to access your Google Drive',
      instructions: [
        '1. Visit the authorization URL',
        '2. Sign in with your Google account',
        '3. Grant permissions to the application',
        '4. Copy the authorization code from the callback',
        '5. Use the /exchange-token endpoint with the code'
      ]
    });

  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate auth URL',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/drive/exchange-token
 * Exchange authorization code for access tokens (for initial setup)
 */
router.post('/exchange-token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'code parameter is required'
      });
    }

    const tokens = await googleDriveService.constructor.getTokensFromCode(code);

    res.json({
      success: true,
      tokens,
      message: 'Tokens obtained successfully. Save the refresh_token in your environment variables.',
      instructions: [
        'Add the following to your .env file:',
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`,
        'Restart your server to use the new tokens'
      ]
    });

  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({
      error: 'Failed to exchange token',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/drive/update-from-generation
 * Convenience endpoint that generates a diagram and immediately updates Google Drive
 * This combines diagram generation with Google Drive update
 */
router.post('/update-from-generation', async (req, res) => {
  try {
    const { 
      type, 
      description, 
      context, 
      style, 
      complexity,
      createBackup = true,
      fileName,
      diagramDescription 
    } = req.body;

    // First, generate the diagram using the existing diagram generation logic
    // You would import and use your diagram generation service here
    
    // For now, I'll assume you have the XML content
    // In a full implementation, you'd call your diagram generation service first
    
    res.json({
      success: true,
      message: 'This endpoint would generate a diagram and then update Google Drive',
      note: 'Implement by combining diagram generation with Google Drive update',
      suggestedFlow: [
        '1. Generate diagram using existing diagram generation service',
        '2. Validate the generated XML',
        '3. Update Google Drive with the new content',
        '4. Return combined results'
      ]
    });

  } catch (error) {
    console.error('Error in combined generation/update:', error);
    res.status(500).json({
      error: 'Failed to generate and update',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;