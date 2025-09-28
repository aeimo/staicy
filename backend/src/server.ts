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
    console.log('Calling agent.query with prompt (trim):', String(prompt).slice(0, 200));
    const response = await agent.query(prompt, system_prompt, style_guide);
    console.log('Agent response:' + response);

    // Parse the response to extract XML and commentary
    let parsedResponse: { xml: string; commentary: string } | null;
    parsedResponse = parseOutput.parseJsonResponse(response);
    
    const chatResponse = parsedResponse?.commentary;
    const xml = parsedResponse?.xml;

    console.log("Chat Response:", chatResponse);
    console.log("Extracted XML:", xml);


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


app.listen(5001, () => console.log('Server running on http://localhost:5001'));
