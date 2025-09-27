import { GeminiAgent } from "./openAIAgent";

async function main() {
    const agent = new GeminiAgent();
    // const prompt = "Generate a simple diagram of a web application architecture with a client, server, and database.";
    try {
        const response = await agent.queryDummy();
        console.log("Response from GeminiAgent: ");
        console.log(response);
    } catch (error) {
        console.error("Error querying GeminiAgent:", error);
    }
}

main();