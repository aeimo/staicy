import { aiService } from './aiService';
import { DiagramType } from '@prisma/client';

interface DiagramGenerationResult {
  xml: string;
  description: string;
  elements: number;
  confidence: number;
  metadata: {
    generationTime: number;
    model: string;
    version: string;
  };
}

interface DiagramAnalysisResult {
  elements: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    connections: string[];
  }>;
  layout: {
    width: number;
    height: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  suggestions: string[];
}

export class AdvancedDiagramService {
  async generateInfrastructureDiagram(description: string): Promise<DiagramGenerationResult> {
    const startTime = Date.now();
    
    const result = await aiService.generateDrawIODiagram({
      prompt: `Create an AWS infrastructure diagram: ${description}`,
      type: 'ARCHITECTURE',
      context: 'AWS infrastructure with load balancers, servers, databases, and networking'
    });

    return {
      ...result,
      metadata: {
        generationTime: Date.now() - startTime,
        model: 'claude-3-5-sonnet',
        version: '1.0'
      }
    };
  }

  async generateProcessFlowchart(processDescription: string): Promise<DiagramGenerationResult> {
    const startTime = Date.now();
    
    const result = await aiService.generateDrawIODiagram({
      prompt: `Create a process flowchart: ${processDescription}`,
      type: 'FLOWCHART',
      context: 'Business process with decision points, actions, and outcomes'
    });

    return {
      ...result,
      metadata: {
        generationTime: Date.now() - startTime,
        model: 'claude-3-5-sonnet',
        version: '1.0'
      }
    };
  }

  async generateSequenceDiagram(interactionDescription: string): Promise<DiagramGenerationResult> {
    const startTime = Date.now();
    
    const result = await aiService.generateDrawIODiagram({
      prompt: `Create a sequence diagram: ${interactionDescription}`,
      type: 'SEQUENCE',
      context: 'System interactions with actors, messages, and timing'
    });

    return {
      ...result,
      metadata: {
        generationTime: Date.now() - startTime,
        model: 'claude-3-5-sonnet',
        version: '1.0'
      }
    };
  }

  async generateNetworkDiagram(networkDescription: string): Promise<DiagramGenerationResult> {
    const startTime = Date.now();
    
    const result = await aiService.generateDrawIODiagram({
      prompt: `Create a network diagram: ${networkDescription}`,
      type: 'NETWORK',
      context: 'Network topology with routers, switches, servers, and connections'
    });

    return {
      ...result,
      metadata: {
        generationTime: Date.now() - startTime,
        model: 'claude-3-5-sonnet',
        version: '1.0'
      }
    };
  }

  async analyzeDiagram(xml: string): Promise<DiagramAnalysisResult> {
    try {
      // Parse XML to extract elements
      const elements = this.parseDiagramElements(xml);
      const layout = this.analyzeLayout(xml);
      const suggestions = this.generateSuggestions(elements, layout);

      return {
        elements,
        layout,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing diagram:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  async optimizeDiagram(xml: string): Promise<string> {
    try {
      // Use AI to optimize the diagram layout and structure
      const result = await aiService.refineDiagram(xml, 'Optimize the layout, improve readability, and ensure proper spacing between elements');
      return result.xml;
    } catch (error) {
      console.error('Error optimizing diagram:', error);
      throw new Error('Failed to optimize diagram');
    }
  }

  async convertDiagramFormat(xml: string, targetFormat: 'mermaid' | 'plantuml' | 'drawio'): Promise<string> {
    try {
      switch (targetFormat) {
        case 'mermaid':
          return this.convertToMermaid(xml);
        case 'plantuml':
          return this.convertToPlantUML(xml);
        case 'drawio':
          return xml; // Already in draw.io format
        default:
          throw new Error(`Unsupported format: ${targetFormat}`);
      }
    } catch (error) {
      console.error('Error converting diagram format:', error);
      throw new Error('Failed to convert diagram format');
    }
  }

  private parseDiagramElements(xml: string): Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    connections: string[];
  }> {
    const elements: Array<{
      id: string;
      type: string;
      label: string;
      position: { x: number; y: number };
      connections: string[];
    }> = [];

    // Parse mxCell elements from XML
    const cellMatches = xml.match(/<mxCell[^>]*>/g) || [];
    
    for (const cellMatch of cellMatches) {
      const idMatch = cellMatch.match(/id="([^"]*)"/);
      const valueMatch = cellMatch.match(/value="([^"]*)"/);
      const styleMatch = cellMatch.match(/style="([^"]*)"/);
      const geometryMatch = cellMatch.match(/<mxGeometry[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*>/);
      
      if (idMatch && valueMatch) {
        elements.push({
          id: idMatch[1],
          type: this.determineElementType(styleMatch?.[1] || ''),
          label: valueMatch[1],
          position: {
            x: geometryMatch ? parseFloat(geometryMatch[1]) : 0,
            y: geometryMatch ? parseFloat(geometryMatch[2]) : 0
          },
          connections: []
        });
      }
    }

    return elements;
  }

  private determineElementType(style: string): string {
    if (style.includes('rounded')) return 'rectangle';
    if (style.includes('ellipse')) return 'ellipse';
    if (style.includes('rhombus')) return 'diamond';
    if (style.includes('arrow')) return 'arrow';
    return 'shape';
  }

  private analyzeLayout(xml: string): {
    width: number;
    height: number;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const elements = this.parseDiagramElements(xml);
    const elementCount = elements.length;
    
    let maxX = 0;
    let maxY = 0;
    
    for (const element of elements) {
      maxX = Math.max(maxX, element.position.x);
      maxY = Math.max(maxY, element.position.y);
    }

    let complexity: 'simple' | 'moderate' | 'complex';
    if (elementCount <= 5) complexity = 'simple';
    else if (elementCount <= 15) complexity = 'moderate';
    else complexity = 'complex';

    return {
      width: maxX + 200, // Add padding
      height: maxY + 200,
      complexity
    };
  }

  private generateSuggestions(elements: any[], layout: any): string[] {
    const suggestions: string[] = [];
    
    if (elements.length === 0) {
      suggestions.push('Consider adding more elements to make the diagram more informative');
    }
    
    if (layout.complexity === 'complex') {
      suggestions.push('The diagram is quite complex - consider breaking it into smaller, focused diagrams');
    }
    
    if (elements.length > 10) {
      suggestions.push('Consider using grouping or layers to organize related elements');
    }
    
    const hasLabels = elements.some(el => el.label && el.label.trim().length > 0);
    if (!hasLabels) {
      suggestions.push('Add descriptive labels to make the diagram more understandable');
    }
    
    return suggestions;
  }

  private convertToMermaid(xml: string): string {
    // Convert draw.io XML to Mermaid syntax
    const elements = this.parseDiagramElements(xml);
    
    let mermaid = 'graph TD\n';
    
    for (const element of elements) {
      if (element.type !== 'arrow' && element.label) {
        const nodeId = element.id.replace(/[^a-zA-Z0-9]/g, '');
        mermaid += `    ${nodeId}["${element.label}"]\n`;
      }
    }
    
    return mermaid;
  }

  private convertToPlantUML(xml: string): string {
    // Convert draw.io XML to PlantUML syntax
    const elements = this.parseDiagramElements(xml);
    
    let plantuml = '@startuml\n';
    
    for (const element of elements) {
      if (element.type !== 'arrow' && element.label) {
        plantuml += `class ${element.label} {\n}\n`;
      }
    }
    
    plantuml += '@enduml';
    return plantuml;
  }
}

export const advancedDiagramService = new AdvancedDiagramService();
