import fs from "fs";
import readline from "readline";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// -------------------------------------------------
// CONFIG
// -------------------------------------------------
const FILE_ID = "1oSfOF8VMs3rnyAB55YzOvlpkv6X6mUft"; // Your Google Drive file ID
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = "credentials.json"; // Download from Google Cloud Console
const TOKEN_PATH = "token.json"; // Stores OAuth token so you don’t log in every time

// -------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------
async function authorize(): Promise<OAuth2Client> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code: string = await new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", (input) => {
      rl.close();
      resolve(input);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  return oAuth2Client;
}

// -------------------------------------------------
// METHOD: Upload XML to Drive
// -------------------------------------------------
export async function updateDiagramWithXml(xml: string): Promise<void> {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  await drive.files.update({
    fileId: FILE_ID,
    media: {
      mimeType: "application/vnd.jgraph.mxfile",
      body: Buffer.from(xml, "utf-8"),
    },
  });

  console.log("✅ Diagram updated with provided XML");
}

// -------------------------------------------------
// Example usage
// -------------------------------------------------
if (require.main === module) {
  const exampleXml = `<?xml version="1.0"?>
<mxfile>
  <diagram id="sample" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell value="Hello World" style="rounded=1;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="20" y="20" width="160" height="80" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  updateDiagramWithXml(exampleXml).catch(console.error);
}
