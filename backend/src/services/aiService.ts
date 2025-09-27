import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Document, DocType, DiagramType, AISuggestion, DocumentContext } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface DiagramGenerationRequest {
  prompt: string;
  type: DiagramType;
  context?: string;
  imageUrl?: string;
}

interface DiagramGenerationResponse {
  xml: string;
  description: string;
  elements: number;
  confidence: number;
}

export class AIService {
  async generateDocumentFromCode(codeContent: string, type: DocType): Promise<any> {
    try {
      const prompt = this.getCodeToDocumentPrompt(codeContent, type);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert technical writer who creates comprehensive documentation from code. Generate well-structured, clear, and professional documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating document from code:', error);
      throw new Error('Failed to generate document from code');
    }
  }

  async createDiagramFromText(description: string, type: DiagramType): Promise<string> {
    try {
      const prompt = this.getDiagramPrompt(description, type);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating diagrams. Generate Mermaid diagram code based on the description. Return only the Mermaid code without any explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error creating diagram:', error);
      throw new Error('Failed to create diagram');
    }
  }

  async generateDrawIODiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    try {
      const systemPrompt = this.getDrawIOSystemPrompt();
      const userPrompt = this.getDrawIOUserPrompt(request);
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const xml = this.extractXMLFromResponse(content.text);
        const validatedXML = await this.validateAndCorrectXML(xml);
        
        return {
          xml: validatedXML,
          description: this.extractDescription(content.text),
          elements: this.countElements(validatedXML),
          confidence: this.calculateConfidence(validatedXML, request.prompt)
        };
      }

      throw new Error('No text content received from Claude');
    } catch (error) {
      console.error('Error generating Draw.io diagram:', error);
      throw new Error('Failed to generate Draw.io diagram');
    }
  }

  async generateDiagramFromImage(imageUrl: string, type: DiagramType): Promise<DiagramGenerationResponse> {
    try {
      const systemPrompt = this.getImageAnalysisSystemPrompt();
      const userPrompt = this.getImageAnalysisUserPrompt(imageUrl, type);
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const description = content.text;
        // Now generate diagram from the description
        return await this.generateDrawIODiagram({
          prompt: description,
          type,
          context: 'Generated from image analysis'
        });
      }

      throw new Error('No text content received from Claude');
    } catch (error) {
      console.error('Error generating diagram from image:', error);
      throw new Error('Failed to generate diagram from image');
    }
  }

  async refineDiagram(existingXML: string, refinementPrompt: string): Promise<DiagramGenerationResponse> {
    try {
      const systemPrompt = this.getRefinementSystemPrompt();
      const userPrompt = this.getRefinementUserPrompt(existingXML, refinementPrompt);
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const xml = this.extractXMLFromResponse(content.text);
        const validatedXML = await this.validateAndCorrectXML(xml);
        
        return {
          xml: validatedXML,
          description: `Refined: ${refinementPrompt}`,
          elements: this.countElements(validatedXML),
          confidence: this.calculateConfidence(validatedXML, refinementPrompt)
        };
      }

      throw new Error('No text content received from Claude');
    } catch (error) {
      console.error('Error refining diagram:', error);
      throw new Error('Failed to refine diagram');
    }
  }

  async suggestImprovements(document: Document): Promise<AISuggestion[]> {
    try {
      const prompt = this.getImprovementPrompt(document);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert technical writing reviewer. Analyze the document and provide specific, actionable suggestions for improvement. Focus on clarity, completeness, structure, and technical accuracy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '[]');
      return suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion-${index}`,
        type: suggestion.type || 'improvement',
        content: suggestion.content,
        confidence: suggestion.confidence || 0.8,
        position: suggestion.position
      }));
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  async extractWorkflowFromDiagram(diagramContent: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing diagrams and extracting workflow information. Convert diagram content into clear, step-by-step workflow descriptions."
          },
          {
            role: "user",
            content: `Analyze this diagram and extract the workflow:\n\n${diagramContent}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error extracting workflow:', error);
      throw new Error('Failed to extract workflow from diagram');
    }
  }

  async generateUMLFromNaturalLanguage(specs: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating UML diagrams. Convert natural language specifications into PlantUML code. Return only the PlantUML code without explanations."
          },
          {
            role: "user",
            content: `Create a UML diagram from these specifications:\n\n${specs}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating UML:', error);
      throw new Error('Failed to generate UML from specifications');
    }
  }

  async autoCompleteDocument(partialContent: any, context: DocumentContext): Promise<string> {
    try {
      const prompt = this.getAutoCompletePrompt(partialContent, context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert technical writer. Complete the partial document content while maintaining consistency with the existing style and structure."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error auto-completing document:', error);
      throw new Error('Failed to auto-complete document');
    }
  }

  async improveDocument(document: Document, improvements: string[]): Promise<any> {
    try {
      const prompt = this.getImprovementApplicationPrompt(document, improvements);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert technical writer. Apply the requested improvements to the document while maintaining its original structure and intent."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error improving document:', error);
      throw new Error('Failed to improve document');
    }
  }

  private getCodeToDocumentPrompt(codeContent: string, type: DocType): string {
    const typeInstructions = {
      API_REFERENCE: "Create comprehensive API documentation with endpoints, parameters, responses, and examples.",
      ARCHITECTURE: "Create architectural documentation explaining the system design, components, and their interactions.",
      SPECIFICATION: "Create detailed technical specifications including requirements, constraints, and implementation details.",
      PROCESS: "Create process documentation explaining workflows, procedures, and best practices.",
      REQUIREMENTS: "Create requirements documentation with functional and non-functional requirements.",
      GUIDE: "Create a comprehensive guide with step-by-step instructions and examples."
    };

    return `
Create ${typeInstructions[type]} from the following code:

Code:
${codeContent}

Generate a well-structured document in JSON format with the following structure:
{
  "title": "Document title",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "subsections": [
        {
          "title": "Subsection title",
          "content": "Subsection content"
        }
      ]
    }
  ],
  "metadata": {
    "summary": "Brief summary",
    "tags": ["tag1", "tag2"],
    "difficulty": "beginner|intermediate|advanced"
  }
}
    `;
  }

  private getDiagramPrompt(description: string, type: DiagramType): string {
    const typeInstructions = {
      FLOWCHART: "Create a flowchart showing the process flow",
      SEQUENCE: "Create a sequence diagram showing interactions between entities",
      CLASS: "Create a class diagram showing object relationships",
      ER: "Create an entity-relationship diagram",
      ARCHITECTURE: "Create an architecture diagram showing system components",
      NETWORK: "Create a network diagram showing connections and topology"
    };

    return `
${typeInstructions[type]} based on this description:

${description}

Generate Mermaid code for the diagram.
    `;
  }

  private getImprovementPrompt(document: Document): string {
    return `
Analyze this document and provide specific improvement suggestions:

Title: ${document.title}
Type: ${document.type}
Content: ${JSON.stringify(document.content)}

Provide suggestions in JSON format:
[
  {
    "type": "improvement|completion|correction|addition",
    "content": "Specific suggestion",
    "confidence": 0.8,
    "position": {
      "start": 0,
      "end": 100
    }
  }
]
    `;
  }

  private getAutoCompletePrompt(partialContent: any, context: DocumentContext): string {
    return `
Complete this partial document:

Document Type: ${context.documentType}
Existing Content: ${JSON.stringify(partialContent)}
Context: ${context.existingContent ? JSON.stringify(context.existingContent) : 'None'}

Continue the document maintaining the same style and structure.
    `;
  }

  private getImprovementApplicationPrompt(document: Document, improvements: string[]): string {
    return `
Apply these improvements to the document:

Document: ${JSON.stringify(document.content)}
Improvements: ${improvements.join(', ')}

Return the improved document in the same JSON structure.
    `;
  }

  // Draw.io specific methods
  private getDrawIOSystemPrompt(): string {
    return `You are an expert diagramming assistant that generates draw.io compatible XML diagrams. 

Your role:
- Generate valid draw.io XML that can be directly imported into draw.io
- Create well-structured diagrams with proper positioning and connections
- Use appropriate shapes, colors, and layouts for the diagram type
- Ensure all XML is well-formed and follows draw.io schema

Rules:
- Always output valid XML without explanations
- Use proper mxGraphModel structure with mxCell elements
- Include proper positioning (x, y coordinates) and sizing
- Create meaningful connections between elements
- Use appropriate shapes for different diagram types
- Follow draw.io XML schema exactly

Example structure:
<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Your diagram elements here -->
      </mxGraphModel>
    </root>
  </diagram>
</mxfile>`;
  }

  private getDrawIOUserPrompt(request: DiagramGenerationRequest): string {
    const typeInstructions = {
      FLOWCHART: "Create a flowchart with decision points, processes, and clear flow direction",
      SEQUENCE: "Create a sequence diagram showing interactions between actors and systems",
      CLASS: "Create a class diagram with classes, attributes, methods, and relationships",
      ER: "Create an entity-relationship diagram with entities, attributes, and relationships",
      ARCHITECTURE: "Create an architecture diagram showing system components and their connections",
      NETWORK: "Create a network diagram showing network topology and connections"
    };

    return `
Generate a ${request.type} diagram based on this description:

${request.prompt}

${request.context ? `Context: ${request.context}` : ''}

Requirements:
- ${typeInstructions[request.type]}
- Use appropriate shapes and colors
- Include clear labels and connections
- Ensure proper spacing and layout
- Make it professional and readable

Output only the draw.io XML without any explanations.`;
  }

  private getImageAnalysisSystemPrompt(): string {
    return `You are an expert at analyzing diagram images and describing their structure.

Your task:
- Analyze the provided diagram image
- Identify all components, shapes, and elements
- Describe the relationships and connections between elements
- Note the layout and positioning
- Provide a clear, structured description that can be used to recreate the diagram

Output format:
- List all components with their labels
- Describe connections between components
- Note any special formatting or styling
- Be specific about element types (rectangles, circles, arrows, etc.)`;
  }

  private getImageAnalysisUserPrompt(imageUrl: string, type: DiagramType): string {
    return `Analyze this diagram image and describe its structure:

Image URL: ${imageUrl}
Diagram Type: ${type}

Please provide a detailed description of:
1. All components and their labels
2. Connections between components
3. Layout and positioning
4. Any special formatting or styling

This description will be used to recreate the diagram programmatically.`;
  }

  private getRefinementSystemPrompt(): string {
    return `You are an expert at modifying existing draw.io diagrams based on user requests.

Your task:
- Take the existing diagram XML and apply the requested changes
- Maintain the overall structure while making specific modifications
- Ensure the output remains valid draw.io XML
- Preserve existing elements that aren't being modified
- Add, remove, or modify elements as requested

Rules:
- Output only the modified XML without explanations
- Maintain proper XML structure
- Keep valid connections and positioning
- Follow draw.io schema requirements`;
  }

  private getRefinementUserPrompt(existingXML: string, refinementPrompt: string): string {
    return `Modify this existing diagram based on the user's request:

Existing Diagram XML:
${existingXML}

User Request: ${refinementPrompt}

Please modify the diagram according to the request while maintaining the overall structure and validity of the XML.`;
  }

  private extractXMLFromResponse(response: string): string {
    // Extract XML from Claude's response
    const xmlMatch = response.match(/<mxfile>[\s\S]*<\/mxfile>/);
    if (xmlMatch) {
      return xmlMatch[0];
    }
    
    // If no mxfile tags, look for any XML structure
    const xmlStart = response.indexOf('<?xml');
    const xmlEnd = response.lastIndexOf('</mxfile>') + 9;
    
    if (xmlStart !== -1 && xmlEnd !== -1) {
      return response.substring(xmlStart, xmlEnd);
    }
    
    throw new Error('No valid XML found in response');
  }

  private async validateAndCorrectXML(xml: string): Promise<string> {
    try {
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        // Try to fix common XML issues
        return this.fixCommonXMLIssues(xml);
      }
      
      return xml;
    } catch (error) {
      console.error('XML validation error:', error);
      return this.fixCommonXMLIssues(xml);
    }
  }

  private fixCommonXMLIssues(xml: string): string {
    // Fix common XML issues
    let fixed = xml;
    
    // Fix unescaped characters
    fixed = fixed.replace(/&/g, '&amp;');
    fixed = fixed.replace(/</g, '&lt;');
    fixed = fixed.replace(/>/g, '&gt;');
    fixed = fixed.replace(/"/g, '&quot;');
    fixed = fixed.replace(/'/g, '&apos;');
    
    // Fix unclosed tags
    const openTags = fixed.match(/<[^/][^>]*>/g) || [];
    const closeTags = fixed.match(/<\/[^>]*>/g) || [];
    
    // Basic tag balancing (simplified)
    for (const tag of openTags) {
      const tagName = tag.match(/<(\w+)/)?.[1];
      if (tagName && !tag.includes('/>')) {
        const closingTag = `</${tagName}>`;
        if (!fixed.includes(closingTag)) {
          // Add closing tag at the end
          fixed = fixed.replace('</mxfile>', `${closingTag}\n</mxfile>`);
        }
      }
    }
    
    return fixed;
  }

  private extractDescription(response: string): string {
    // Extract description from response
    const lines = response.split('\n');
    const descriptionLines = lines.filter(line => 
      !line.includes('<?xml') && 
      !line.includes('<mxfile>') && 
      !line.includes('</mxfile>') &&
      line.trim().length > 0
    );
    
    return descriptionLines.join(' ').trim() || 'Generated diagram';
  }

  private countElements(xml: string): number {
    const cellMatches = xml.match(/<mxCell/g);
    return cellMatches ? cellMatches.length : 0;
  }

  private calculateConfidence(xml: string, prompt: string): number {
    // Simple confidence calculation based on XML validity and prompt coverage
    let confidence = 0.5; // Base confidence
    
    // Check XML validity
    if (xml.includes('<mxfile>') && xml.includes('</mxfile>')) {
      confidence += 0.3;
    }
    
    // Check for basic elements
    if (xml.includes('<mxCell')) {
      confidence += 0.2;
    }
    
    // Check prompt coverage (simplified)
    const promptWords = prompt.toLowerCase().split(' ');
    const xmlLower = xml.toLowerCase();
    const coveredWords = promptWords.filter(word => 
      word.length > 3 && xmlLower.includes(word)
    ).length;
    
    confidence += (coveredWords / promptWords.length) * 0.2;
    
    return Math.min(confidence, 1.0);
  }
}

export const aiService = new AIService();
