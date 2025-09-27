import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

interface DriveUpdateRequest {
  xmlContent: string;
  fileName?: string;
  description?: string;
}

interface DriveUpdateResponse {
  success: boolean;
  fileId: string;
  webViewLink: string;
  directLink?: string;
  error?: string;
}

/**
 * Google Drive service for updating Draw.io diagrams
 */
export class GoogleDriveService {
  private drive: any;
  private targetFileId = '1oSfOF8VMs3rnyAB55YzOvlpkv6X6mUft'; // Extracted from your URL

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize Google Drive API authentication
   */
  private async initializeAuth() {
    try {
      // Option 1: Service Account (Recommended for backend)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file'
          ]
        });
        
        this.drive = google.drive({ version: 'v3', auth });
      }
      // Option 2: OAuth2 Client
      else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
        );

        // Set credentials if refresh token is available
        if (process.env.GOOGLE_REFRESH_TOKEN) {
          oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
          });
        }

        this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      }
      // Option 3: Default application credentials
      else {
        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file'
          ]
        });

        this.drive = google.drive({ version: 'v3', auth });
      }

      console.log('Google Drive API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      throw new Error('Google Drive authentication failed');
    }
  }

  /**
   * Update the Draw.io file on Google Drive with new XML content
   */
  async updateDrawioDiagram(request: DriveUpdateRequest): Promise<DriveUpdateResponse> {
    try {
      if (!this.drive) {
        throw new Error('Google Drive API not initialized');
      }

      console.log(`Updating Draw.io file ${this.targetFileId} with new XML content`);

      // First, get current file metadata
      const fileMetadata = await this.drive.files.get({
        fileId: this.targetFileId,
        fields: 'id,name,mimeType,webViewLink'
      });

      console.log('Current file metadata:', fileMetadata.data);

      // Create a temporary file with the XML content
      const tempFilePath = path.join(process.cwd(), 'temp_diagram.drawio');
      fs.writeFileSync(tempFilePath, request.xmlContent, 'utf8');

      try {
        // Update the file content
        const updateResponse = await this.drive.files.update({
          fileId: this.targetFileId,
          media: {
            mimeType: 'application/vnd.jgraph.mxfile',
            body: fs.createReadStream(tempFilePath)
          },
          fields: 'id,webViewLink,modifiedTime'
        });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        console.log('File updated successfully:', updateResponse.data);

        // Generate the direct Draw.io edit link
        const directEditLink = `https://app.diagrams.net/#G${this.targetFileId}`;

        return {
          success: true,
          fileId: this.targetFileId,
          webViewLink: updateResponse.data.webViewLink,
          directLink: directEditLink
        };

      } catch (updateError) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw updateError;
      }

    } catch (error) {
      console.error('Error updating Draw.io file:', error);
      
      return {
        success: false,
        fileId: this.targetFileId,
        webViewLink: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get file information from Google Drive
   */
  async getFileInfo(): Promise<any> {
    try {
      if (!this.drive) {
        throw new Error('Google Drive API not initialized');
      }

      const response = await this.drive.files.get({
        fileId: this.targetFileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,owners,permissions'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  /**
   * Download current file content
   */
  async downloadCurrentContent(): Promise<string> {
    try {
      if (!this.drive) {
        throw new Error('Google Drive API not initialized');
      }

      const response = await this.drive.files.get({
        fileId: this.targetFileId,
        alt: 'media'
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading file content:', error);
      throw error;
    }
  }

  /**
   * Create a backup of the current file before updating
   */
  async createBackup(): Promise<string> {
    try {
      if (!this.drive) {
        throw new Error('Google Drive API not initialized');
      }

      // Get current file
      const currentFile = await this.drive.files.get({
        fileId: this.targetFileId,
        fields: 'name'
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${currentFile.data.name}_backup_${timestamp}`;

      // Copy the file
      const copyResponse = await this.drive.files.copy({
        fileId: this.targetFileId,
        requestBody: {
          name: backupName
        }
      });

      console.log(`Backup created: ${backupName} (ID: ${copyResponse.data.id})`);
      return copyResponse.data.id;

    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Update file with backup option
   */
  async updateWithBackup(request: DriveUpdateRequest & { createBackup?: boolean }): Promise<DriveUpdateResponse & { backupId?: string }> {
    try {
      let backupId: string | undefined;

      // Create backup if requested
      if (request.createBackup) {
        backupId = await this.createBackup();
      }

      // Update the main file
      const updateResult = await this.updateDrawioDiagram(request);

      return {
        ...updateResult,
        backupId
      };

    } catch (error) {
      console.error('Error updating file with backup:', error);
      return {
        success: false,
        fileId: this.targetFileId,
        webViewLink: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Set up OAuth2 authorization URL (for initial setup)
   */
  static getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
  }

  /**
   * Exchange authorization code for tokens (for initial setup)
   */
  static async getTokensFromCode(code: string): Promise<any> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }
}

// Singleton instance
export const googleDriveService = new GoogleDriveService();

export default GoogleDriveService;