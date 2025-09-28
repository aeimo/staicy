import googleDrive = require("../src/googleDrive");
import { GeminiAgent } from "./openAIAgent";
import { PromptBuilder } from "./promptBuilder";

async function main() {
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
    googleDrive.createDiagram(response);
}

main();