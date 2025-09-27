import PromptBuilder from "./promptBuilder";

export interface LLMClient {
    query(prompt: string): Promise<string>;
}

// Gemini Agent Implementation 
export class GeminiAgent implements LLMClient {
    private apiKey: string;
    private model: string = '';


    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    async query(prompt: string): Promise<string> {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta2/models/${this.model}:generateContent?key=${this.apiKey}`;

        const contents = [
            { role: 'system', content: PromptBuilder.getSystemPrompt() },
            { role: 'user', content: prompt }
        ];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API error: ${error?.error?.message || "request failed"}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content;
    }
    
    async queryDummy(prompt: string): Promise<string> {
        return Promise.resolve(getHardcodedDiagram());
    }
}


// OpenAI Agent Implementation
export class OpenAIAgent implements LLMClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async query(prompt: string): Promise<string> {
        type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
        const messages: ChatMessage[] = [];

        messages.push({ role: 'system', content: PromptBuilder.getSystemPrompt() });
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: messages,
                max_tokens: 2000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async queryDummy(prompt: string): Promise<string> {
        return Promise.resolve(getHardcodedDiagram());
    }
}


function getHardcodedDiagram(): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <mxfile host="app.diagrams.net">
        <diagram name="System Architecture" id="system-arch">
            <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
            <root>
                <mxCell id="0" />
                <mxCell id="1" parent="0" />
                
                <!-- Main Components -->
                <mxCell id="user" value="User" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
                <mxGeometry x="40" y="200" width="120" height="60" as="geometry" />
                </mxCell>
                
                <mxCell id="frontend" value="Frontend&#xa;React App" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
                <mxGeometry x="240" y="200" width="120" height="60" as="geometry" />
                </mxCell>
                
                <mxCell id="api" value="API Gateway&#xa;Express.js" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
                <mxGeometry x="440" y="200" width="120" height="60" as="geometry" />
                </mxCell>
                
                <mxCell id="auth" value="Auth Service&#xa;JWT" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
                <mxGeometry x="640" y="120" width="120" height="60" as="geometry" />
                </mxCell>
                
                <mxCell id="database" value="Database&#xa;PostgreSQL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
                <mxGeometry x="640" y="280" width="120" height="60" as="geometry" />
                </mxCell>
                
                <!-- Connections -->
                <mxCell id="edge1" value="" style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1" source="user" target="frontend">
                <mxGeometry width="50" height="50" relative="1" as="geometry">
                    <mxPoint x="170" y="230" as="sourcePoint" />
                    <mxPoint x="230" y="230" as="targetPoint" />
                </mxGeometry>
                </mxCell>
                
                <mxCell id="edge2" value="" style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1" source="frontend" target="api">
                <mxGeometry width="50" height="50" relative="1" as="geometry">
                    <mxPoint x="370" y="230" as="sourcePoint" />
                    <mxPoint x="430" y="230" as="targetPoint" />
                </mxGeometry>
                </mxCell>
                
                <mxCell id="edge3" value="" style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1" source="api" target="auth">
                <mxGeometry width="50" height="50" relative="1" as="geometry">
                    <mxPoint x="500" y="200" as="sourcePoint" />
                    <mxPoint x="630" y="150" as="targetPoint" />
                </mxGeometry>
                </mxCell>
                
                <mxCell id="edge4" value="" style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1" source="api" target="database">
                <mxGeometry width="50" height="50" relative="1" as="geometry">
                    <mxPoint x="500" y="260" as="sourcePoint" />
                    <mxPoint x="630" y="310" as="targetPoint" />
                </mxGeometry>
                </mxCell>
                
                <!-- Labels -->
                <mxCell id="label1" value="HTTP Request" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
                <mxGeometry x="180" y="180" width="80" height="20" as="geometry" />
                </mxCell>
                
                <mxCell id="label2" value="API Call" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
                <mxGeometry x="380" y="180" width="60" height="20" as="geometry" />
                </mxCell>
                
                <mxCell id="label3" value="Authenticate" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
                <mxGeometry x="540" y="140" width="80" height="20" as="geometry" />
                </mxCell>
                
                <mxCell id="label4" value="Query Data" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
                <mxGeometry x="540" y="300" width="80" height="20" as="geometry" />
                </mxCell>
            </root>
            </mxGraphModel>
        </diagram>
        </mxfile>`
    }