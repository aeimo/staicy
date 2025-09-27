import PromptBuilder from "./promptBuilder";

export interface LLMClient {
    query(prompt: string, system_prompt: string): Promise<string>;
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
}