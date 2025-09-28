// server/index.ts
import express from 'express';
import cors from 'cors';
import { GeminiAgent } from '../utils/openAIAgent';
import { PromptBuilder } from '../utils/promptBuilder';
import { parseOutput } from '../utils/parseOutput';
import { DriveDiagramManager } from './googleDrive';




const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit if needed


const agent = new GeminiAgent();
const Pb = new PromptBuilder();


// POST /api/message - runs the GeminiAgent workflow
app.post('/api/message', async (req, res) => {
 const { prompt: userPrompt, files } = req.body;
    console.log("Received prompt:", userPrompt);

 // Build prompt for the agent
 const system_prompt = Pb.getSystemPrompt();
 const style_guide = Pb.getStyleGuide();
 const additional_context = userPrompt || "Make a random XML. I have not given any files. Make sure the XML is valid. It has to load properly in draw.io.";
 const prompt = Pb.buildInitialPrompt(files, additional_context);


 try {
   // Query GeminiAgent
    console.log('Calling agent.query with promp:\n\n' + String(prompt) + '\n\n');
    const response = await agent.query(prompt, system_prompt, style_guide);
    console.log('Agent response: \n' + response);

    // Parse the response to extract XML and commentary
    let parsedResponse: { xml: string; commentary: string } | null;
    parsedResponse = parseOutput.parseJsonResponse(response);
    
    const chatResponse = parsedResponse?.commentary;
    const xml = parsedResponse?.xml;

    console.log("Chat Response: \n", chatResponse, "\n");
    console.log("Extracted XML:", xml, "\n");


    const driverManager = new DriveDiagramManager();
    await driverManager.init();
    
    if (!xml) {
      throw new Error("No XML found in the agent's response.");
    }
    
    await driverManager.updateDiagram(xml);



   // Skip Google Drive for now - comment out these lines
   // const driveResult = await googleDrive.createDiagram(responseXml);


   // Return XML without Google Drive info
   res.json({ content: chatResponse, driveInfo: null });
 } catch (error) {
   console.error("Error querying GeminiAgent:", error);
   res.status(500).json({ error: "Failed to generate diagram" });
 }
});


app.listen(5001, async () => {
  console.log('Server running on http://localhost:5001');

  // Run init AFTER server is up
  const dM = new DriveDiagramManager();
  await dM.init()
  const xml = 
    `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36" version="28.2.5">
  <diagram name="Page-1" id="0">
    <mxGraphModel dx="877" dy="608" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="d-TJZZJhtkehiR7Rgj9r-2" value="&lt;font data-font-src=&quot;https://fonts.googleapis.com/css?family=Story+Script&quot; face=&quot;Story Script&quot; style=&quot;color: rgb(0, 0, 0); font-size: 36px;&quot;&gt;Generating Your Diagram...&lt;/font&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FFFFFF;" parent="1" vertex="1">
          <mxGeometry x="270" y="210" width="310" height="130" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
    `;

  await dM.updateDiagram(xml)
    .catch(err => console.error("DriveDiagramManager init failed:", err));
});
