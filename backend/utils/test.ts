import { GeminiAgent } from "./openAIAgent";
import { PromptBuilder } from "./promptBuilder";
import { DriveDiagramManager } from '../src/googleDrive';



async function main() {
    let diagramManager: DriveDiagramManager;

    diagramManager = new DriveDiagramManager();
    await diagramManager.init();

    const dummyXml = `<?xml version="1.0" encoding="UTF-8"?>
    <mxfile>
        <diagram id="demo" name="Page-1">
        <mxGraphModel>
            <root>
            <mxCell id="0"/>
            <mxCell id="1" parent="0"/>
            </root>
        </mxGraphModel>
        </diagram>
    </mxfile>`;

    await diagramManager.updateDiagram(dummyXml);

    const agent = new GeminiAgent();
    const Pb = new PromptBuilder();
    console.log(Pb.getPrompts());
    const system_prompt = Pb.getSystemPrompt();
    const style_guide = Pb.getStyleGuide();
    const additional_context = "Make a random XML. I have not given any files. Make sure the XML is valid. It has to load properly in draw.io.";
    const prompt = Pb.buildInitialPrompt([], additional_context);
    let response: string;
    try {
        response = await agent.query(prompt, system_prompt, style_guide);
        console.log("Response from GeminiAgent: ");
        console.log(response);
    } catch (error) {
        console.error("Error querying GeminiAgent:", error);
        response = "";
    }
    await diagramManager.updateDiagram(response);
}

main();