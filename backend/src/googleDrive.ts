import * as fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as path from "path";
import { Readable } from "stream";
import { file } from "googleapis/build/src/apis/file";
// -------------------------------------------------
// CONFIG
// -------------------------------------------------
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json"); // Download from Google Cloud Console
const TOKEN_PATH = "token.json"; // Stores OAuth token so you don’t log in every time
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
async function createDiagram(xml: string): Promise<void> {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: FILE_NAME,
    mimeType: "application/vnd.jgraph.mxfile",
  };

const media = {
  mimeType: "application/vnd.jgraph.mxfile",
  body: Readable.from([xml]), // Wrap XML string in a readable stream
};

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name",
  });

  const fileId = response.data.id!;
  console.log(`✅ Diagram created on Drive with ID: ${fileId}`);

  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "writer",
      type: "anyone",
    },
  });

  const driveLink = `https://drive.google.com/file/d/${fileId}/view`;
  const drawioLink = `https://app.diagrams.net/?mode=google&fileId=${fileId}`;
  console.log(`🔗 Public Drive Link: ${driveLink}`);
  console.log(`🔗 Open in draw.io: ${drawioLink}`);
}

// -------------------------------------------------
// RUN
// -------------------------------------------------
if (require.main === module) {
  const dummyXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile version="1.0">
  <diagram id="dummy" name="Page-1">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  createDiagram(dummyXml).catch(console.error);
}

export { createDiagram };
