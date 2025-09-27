import { DiagramType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DiagramService {
  async generateMermaidDiagram(prompt: string, type: DiagramType): Promise<string> {
    try {
      // This would integrate with AI service to generate Mermaid code
      const mermaidCode = this.getMermaidTemplate(type);
      return mermaidCode;
    } catch (error) {
      console.error('Error generating Mermaid diagram:', error);
      throw new Error('Failed to generate Mermaid diagram');
    }
  }

  async convertToDrawIO(mermaidContent: any): Promise<string> {
    try {
      // This would convert Mermaid code to Draw.io XML format
      // For now, return a placeholder
      const drawIOXML = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Converted from Mermaid -->
      </mxGraphModel>
    </root>
  </diagram>
</mxfile>`;
      
      return drawIOXML;
    } catch (error) {
      console.error('Error converting to Draw.io:', error);
      throw new Error('Failed to convert to Draw.io format');
    }
  }

  async syncWithDrawIO(diagramId: string, drawIOContent: string): Promise<void> {
    try {
      // Update diagram content with Draw.io content
      await prisma.diagram.update({
        where: { id: diagramId },
        data: {
          content: { drawio: drawIOContent }
        }
      });
    } catch (error) {
      console.error('Error syncing with Draw.io:', error);
      throw new Error('Failed to sync with Draw.io');
    }
  }

  async extractTextFromDiagram(diagramContent: any): Promise<string> {
    try {
      // Extract text content from diagram
      if (diagramContent.mermaid) {
        return this.extractTextFromMermaid(diagramContent.mermaid);
      } else if (diagramContent.drawio) {
        return this.extractTextFromDrawIO(diagramContent.drawio);
      } else if (diagramContent.plantuml) {
        return this.extractTextFromPlantUML(diagramContent.plantuml);
      }
      
      return 'No text content found in diagram';
    } catch (error) {
      console.error('Error extracting text from diagram:', error);
      throw new Error('Failed to extract text from diagram');
    }
  }

  async validateDiagram(content: any, type: DiagramType): Promise<ValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (type === 'FLOWCHART' && content.mermaid) {
        const validation = this.validateMermaidFlowchart(content.mermaid);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      } else if (type === 'SEQUENCE' && content.mermaid) {
        const validation = this.validateMermaidSequence(content.mermaid);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error validating diagram:', error);
      return {
        isValid: false,
        errors: ['Failed to validate diagram'],
        warnings: []
      };
    }
  }

  async exportDiagram(content: any, format: string): Promise<string> {
    try {
      switch (format) {
        case 'png':
          return await this.exportToPNG(content);
        case 'svg':
          return await this.exportToSVG(content);
        case 'pdf':
          return await this.exportToPDF(content);
        case 'json':
          return JSON.stringify(content);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting diagram:', error);
      throw new Error(`Failed to export diagram as ${format}`);
    }
  }

  private getMermaidTemplate(type: DiagramType): string {
    const templates = {
      FLOWCHART: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
      SEQUENCE: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response`,
      CLASS: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }`,
      ER: `erDiagram
    USER ||--o{ ORDER : places
    USER {
        string name
        string email
    }
    ORDER {
        int id
        date created
    }`,
      ARCHITECTURE: `graph TB
    subgraph "Frontend"
        A[React App]
    end
    subgraph "Backend"
        B[API Server]
        C[Database]
    end
    A --> B
    B --> C`,
      NETWORK: `graph LR
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    C --> E[Database]
    D --> E`
    };

    return templates[type] || templates.FLOWCHART;
  }

  private extractTextFromMermaid(mermaidCode: string): string {
    // Extract text from Mermaid code
    const textMatches = mermaidCode.match(/\[([^\]]+)\]/g);
    return textMatches ? textMatches.map(match => match.slice(1, -1)).join(' ') : '';
  }

  private extractTextFromDrawIO(drawIOContent: string): string {
    // Extract text from Draw.io XML
    const textMatches = drawIOContent.match(/<mxCell[^>]*value="([^"]*)"[^>]*>/g);
    return textMatches ? textMatches.map(match => {
      const valueMatch = match.match(/value="([^"]*)"/);
      return valueMatch ? valueMatch[1] : '';
    }).join(' ') : '';
  }

  private extractTextFromPlantUML(plantUMLCode: string): string {
    // Extract text from PlantUML code
    const textMatches = plantUMLCode.match(/:\s*([^;]+);/g);
    return textMatches ? textMatches.map(match => match.slice(2, -1)).join(' ') : '';
  }

  private validateMermaidFlowchart(mermaidCode: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation rules
    if (!mermaidCode.includes('graph')) {
      errors.push('Flowchart must start with "graph" declaration');
    }

    if (!mermaidCode.includes('-->')) {
      warnings.push('Flowchart should contain connections (-->)');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private validateMermaidSequence(mermaidCode: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!mermaidCode.includes('sequenceDiagram')) {
      errors.push('Sequence diagram must start with "sequenceDiagram" declaration');
    }

    if (!mermaidCode.includes('participant')) {
      warnings.push('Sequence diagram should define participants');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private async exportToPNG(content: any): Promise<string> {
    // This would use a service like Puppeteer to render the diagram as PNG
    // For now, return a placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  private async exportToSVG(content: any): Promise<string> {
    // This would convert the diagram to SVG format
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/></svg>';
  }

  private async exportToPDF(content: any): Promise<string> {
    // This would convert the diagram to PDF format
    return 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQo+PgpzdHJlYW0K';
  }
}

export const diagramService = new DiagramService();
