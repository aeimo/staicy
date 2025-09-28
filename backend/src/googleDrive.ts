import * as fs from "fs";
import { google } from "googleapis";
const path = require("path");
import { OAuth2Client } from "google-auth-library";

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
console.log("xml:", xml);
  const fileMetadata = {
    name: FILE_NAME,
    mimeType: "application/vnd.jgraph.mxfile",
  };

  const media = {
    mimeType: "application/vnd.jgraph.mxfile",
    body: fs.createReadStream("diagram.drawio"),
  };


  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name",
  });

  console.log(`✅ Diagram created on Drive with ID: ${response.data.id}`);
}

// -------------------------------------------------
// RUN
// -------------------------------------------------
if (require.main === module) {
  const xml = `<mxfile version="1.0">
  <diagram id="sample" name="Page-1">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root></root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  createDiagram(xml).catch(console.error);
}

export { createDiagram };
