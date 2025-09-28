import * as fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as path from "path";
import { Readable } from "stream";
// -------------------------------------------------
// CONFIG
// -------------------------------------------------
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json"); // Download from Google Cloud Console
const TOKEN_PATH = path.join(__dirname, "token.json");

const FILE_NAME = "diagram.drawio"; // Name for the new diagram file
// -------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------
async function authorize(): Promise<OAuth2Client> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  console.log("Then add the generated token as 'token.json' manually or implement readline logic.");
  throw new Error("No token found. Please add token.json.");
}



// -------------------------------------------------
// METHOD: Create XML Diagram on Drive
// -------------------------------------------------
export class DriveDiagramManager {
  private drive: any;
  private fileId: string | null = null;

  constructor() {
    this.drive = null;
  }

  // Ensure file exists, create if not
  async init(): Promise<void> {
    const auth = await authorize();
    const drive = google.drive({ version: "v3", auth });
    this.drive = drive;

    const listRes = await this.drive.files.list({
      q: `name='${FILE_NAME}' and mimeType='application/vnd.jgraph.mxfile' and trashed=false`,
      fields: "files(id, name)",
    });

    if (listRes.data.files && listRes.data.files.length > 0) {
      this.fileId = listRes.data.files[0].id!;
      console.log(`♻️ Found existing diagram with ID: ${this.fileId}`);
    } else {
      const fileMetadata = {
        name: FILE_NAME,
        mimeType: "application/vnd.jgraph.mxfile",
      };

      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?><mxfile></mxfile>`;
      const media = {
        mimeType: "application/vnd.jgraph.mxfile",
        body: Readable.from([emptyXml]),
      };

      const createRes = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id",
      });

      this.fileId = createRes.data.id!;
      console.log(`✅ Created new diagram with ID: ${this.fileId}`);

      // Optional: make it writable by anyone with link
      await this.drive.permissions.create({
        fileId: this.fileId,
        requestBody: {
          role: "writer",
          type: "anyone",
        },
      });
    }
  }

  async updateDiagram(xml: string): Promise<string> {
    if (!this.fileId) {
      throw new Error("Diagram file not initialized. Call init() first.");
    }

    const media = {
      mimeType: "application/vnd.jgraph.mxfile",
      body: Readable.from([xml]),
    };

    await this.drive.files.update({
      fileId: this.fileId,
      media,
    });

    console.log(`📄 Diagram updated on Drive (ID: ${this.fileId})`);

    const shareableLink = `https://app.diagrams.net/?mode=google&fileId=${this.fileId}`;
    console.log(`🔗 Open in draw.io: https://app.diagrams.net/?mode=google&fileId=${this.fileId}`);

    return shareableLink
  }
}
