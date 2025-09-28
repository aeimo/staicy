import * as fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = __dirname + "/credentials.json";
const TOKEN_PATH = __dirname + "/token.json";

async function run() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret, redirect_uris } = creds;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES });
  console.log("Visit this URL, authorize the app, then paste the code here:\n", authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Enter authorization code: ", async (code) => {
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code.trim());
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log("Saved token to", TOKEN_PATH);
    process.exit(0);
  });
}

run().catch(err => { console.error(err); process.exit(1); });