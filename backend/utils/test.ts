// import { GeminiAgent } from "./openAIAgent";
// import { PromptBuilder } from "./promptBuilder";
import { DriveDiagramManager } from '../src/googleDrive';



async function main() {
    let diagramManager: DriveDiagramManager;

    diagramManager = new DriveDiagramManager();
    await diagramManager.init();

    const dummyXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36" version="28.2.5">
  <diagram name="Page-1" id="0">
    <mxGraphModel dx="877" dy="608" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="d-TJZZJhtkehiR7Rgj9r-3" value="" style="rounded=1;whiteSpace=wrap;html=1;strokeColor=none;fillColor=#A8A8A8;" vertex="1" parent="1">
          <mxGeometry x="190" y="140" width="430" height="230" as="geometry" />
        </mxCell>
        <mxCell id="d-TJZZJhtkehiR7Rgj9r-2" value="&lt;font face=&quot;Lucida Console&quot; style=&quot;color: rgb(255, 255, 255); font-size: 48px;&quot;&gt;Generating Your Diagram...&lt;/font&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#6E6E6E;" vertex="1" parent="1">
          <mxGeometry x="190" y="140" width="420" height="200" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>

`;

    await diagramManager.updateDiagram(dummyXml);

    // const agent = new GeminiAgent();
    // const Pb = new PromptBuilder();
    // console.log(Pb.getPrompts());
    // const system_prompt = Pb.getSystemPrompt();
    // const style_guide = Pb.getStyleGuide();
    // const additional_context = "Make a random XML. I have not given any files. Make sure the XML is valid. It has to load properly in draw.io.";
    // const prompt = Pb.buildInitialPrompt([], additional_context);
    // let response: string;
    // try {
    //     response = await agent.query(prompt, system_prompt, style_guide);
    //     console.log("Response from GeminiAgent: ");
    //     console.log(response);
    // } catch (error) {
    //     console.error("Error querying GeminiAgent:", error);
    //     response = "";
    // }
    // await diagramManager.updateDiagram(response);
}

main();