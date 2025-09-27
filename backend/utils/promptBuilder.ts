export type DiagramType = 
  | 'flowchart' 
  | 'sequence' 
  | 'class' 
  | 'er' 
  | 'architecture' 
  | 'network' 
  | 'mindmap'
  | 'org-chart'
  | 'timeline'
  | 'wireframe';

export interface DiagramRequest {
  type: DiagramType;
  description: string;
  context?: string;
  style?: 'minimal' | 'detailed' | 'professional' | 'creative';
  complexity?: 'simple' | 'moderate' | 'complex';
  imageUrl?: string;
}

export interface RefinementRequest {
  existingXML: string;
  changes: string;
  type: DiagramType;
}

/**
 * Builds optimized prompts for LLM diagram generation
 */
export class PromptBuilder {
  
  /**
   * Generate system prompt for Draw.io diagram creation
   */
  static getSystemPrompt(): string {
    return `You are an expert diagramming assistant that generates draw.io compatible XML diagrams.

Your role:
- Generate valid draw.io XML that can be directly imported into draw.io
- Create well-structured diagrams with proper positioning and connections
- Use appropriate shapes, colors, and layouts for the diagram type
- Ensure all XML is well-formed and follows draw.io schema

Rules:
- Always output valid XML without explanations or code blocks
- Use proper mxGraphModel structure with mxCell elements
- Include proper positioning (x, y coordinates) and sizing (width, height)
- Create meaningful connections between elements using proper edge syntax
- Use appropriate shapes for different diagram types
- Follow draw.io XML schema exactly
- Ensure IDs are unique and properly referenced

Output format:
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="genai-drawio-backend" version="21.7.5">
  <diagram id="generated" name="Generated Diagram">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Your diagram elements here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }

  /**
   * Generate user prompt for specific diagram type and requirements
   */
  static getUserPrompt(request: DiagramRequest): string {
    const typeInstructions = this.getTypeSpecificInstructions(request.type);
    const styleInstructions = this.getStyleInstructions(request.style || 'professional');
    const complexityInstructions = this.getComplexityInstructions(request.complexity || 'moderate');

    let prompt = `Generate a ${request.type} diagram based on this description:

${request.description}

${request.context ? `Context: ${request.context}` : ''}

Requirements:
${typeInstructions}
${styleInstructions}
${complexityInstructions}

Technical requirements:
- Use proper draw.io XML structure
- Include clear labels and appropriate shapes
- Ensure proper spacing and professional layout
- Use consistent colors and styling
- Make connections clear and meaningful
- Position elements logically on the canvas

Output only the draw.io XML without any explanations or code blocks.`;

    return prompt;
  }

  /**
   * Generate prompt for image-based diagram creation
   */
  static getImageAnalysisPrompt(imageUrl: string, diagramType: DiagramType): string {
    return `Analyze the provided image and create a ${diagramType} diagram that represents the same information.

Image URL: ${imageUrl}

Please:
1. Identify all components, elements, and relationships shown in the image
2. Understand the flow, structure, or hierarchy depicted
3. Recreate the diagram using proper draw.io XML format
4. Maintain the logical structure while improving the visual presentation
5. Use appropriate shapes and connections for a ${diagramType}

Focus on:
- Accurate representation of the original information
- Professional styling and layout
- Clear labeling and connections
- Proper use of draw.io elements

Output only the draw.io XML without explanations.`;
  }

  /**
   * Generate prompt for refining existing diagrams
   */
  static getRefinementPrompt(request: RefinementRequest): string {
    return `Modify the existing draw.io diagram based on the requested changes.

Current diagram XML:
${request.existingXML}

Requested changes: ${request.changes}

Please:
1. Apply the requested modifications while preserving the overall structure
2. Maintain valid draw.io XML format
3. Keep existing elements that aren't being modified
4. Ensure all connections remain valid after changes
5. Maintain professional styling and layout

Guidelines:
- Only modify what's specifically requested
- Preserve element IDs where possible to maintain references
- Update positioning if elements are added/moved
- Ensure the final diagram is coherent and well-structured

Output only the modified draw.io XML without explanations.`;
  }

  /**
   * Get type-specific instructions for different diagram types
   */
  private static getTypeSpecificInstructions(type: DiagramType): string {
    const instructions = {
      flowchart: `- Use rectangles for processes, diamonds for decisions, ovals for start/end
- Include clear decision paths with Yes/No labels
- Show process flow with directional arrows
- Use appropriate connector types for different flow types`,

      sequence: `- Use rectangles for actors/objects at the top
- Draw lifelines as vertical dashed lines
- Use arrows for messages between actors
- Include activation boxes for active periods
- Label all messages clearly`,

      class: `- Use rectangles divided into sections for classes
- Show class name, attributes, and methods
- Use appropriate connectors for relationships (inheritance, composition, aggregation)
- Include visibility indicators (+, -, #, ~)
- Group related classes logically`,

      er: `- Use rectangles for entities
- Use ovals for attributes
- Use diamonds for relationships
- Show cardinality on relationship lines
- Use proper ERD notation for keys and constraints`,

      architecture: `- Use rectangles and containers for system components
- Show clear boundaries between different layers/systems
- Use arrows to indicate data flow and dependencies
- Include external systems and integrations
- Group related components logically`,

      network: `- Use appropriate symbols for network devices (routers, switches, servers)
- Show network connections with labeled lines
- Include IP addresses and network segments
- Use proper network topology representation
- Show security boundaries and zones`,

      mindmap: `- Use a central topic node
- Branch out with main topics using curved connections
- Use different colors for different branches
- Keep text concise and hierarchical
- Use appropriate node sizes based on importance`,

      'org-chart': `- Use rectangles for positions/roles
- Show hierarchical relationships with connecting lines
- Include names and titles in each box
- Use consistent sizing and alignment
- Show reporting relationships clearly`,

      timeline: `- Use horizontal or vertical timeline representation
- Mark key events with appropriate symbols
- Include dates and event descriptions
- Use consistent spacing for time intervals
- Show dependencies or relationships between events`,

      wireframe: `- Use simple geometric shapes for UI elements
- Focus on layout and structure, not visual design
- Include placeholders for content areas
- Show navigation and interaction elements
- Use consistent grid alignment`
    };

    return instructions[type] || '- Create a clear and professional diagram following best practices';
  }

  /**
   * Get style-specific instructions
   */
  private static getStyleInstructions(style: string): string {
    const instructions = {
      minimal: `Style: Minimal and clean
- Use simple shapes and minimal colors
- Focus on clarity over decoration
- Use standard shapes without custom styling
- Keep text simple and readable`,

      detailed: `Style: Detailed and comprehensive
- Include all relevant information and labels
- Use rich formatting and multiple colors
- Add icons and detailed annotations
- Show comprehensive relationships and data`,

      professional: `Style: Professional and polished
- Use consistent corporate color scheme
- Apply proper spacing and alignment
- Include clear legends and annotations
- Follow industry standard conventions`,

      creative: `Style: Creative and visually appealing
- Use varied colors and creative shapes
- Include visual elements that enhance understanding
- Apply modern design principles
- Make the diagram engaging and memorable`
    };

    return instructions[style] || instructions.professional;
  }

  /**
   * Get complexity-specific instructions
   */
  private static getComplexityInstructions(complexity: string): string {
    const instructions = {
      simple: `Complexity: Simple and focused
- Include only essential elements (3-7 main components)
- Use basic shapes and connections
- Focus on core concepts and relationships
- Keep the diagram easy to understand at first glance`,

      moderate: `Complexity: Moderate detail level
- Include 5-15 main components with supporting details
- Show important relationships and dependencies
- Balance detail with readability
- Include necessary context and explanations`,

      complex: `Complexity: Comprehensive and detailed
- Include all relevant components (10+ elements)
- Show detailed relationships and dependencies
- Include supporting information and context
- Create a complete picture of the system/process`
    };

    return instructions[complexity] || instructions.moderate;
  }

  /**
   * Generate prompts for specific use cases
   */
  static getUseCasePrompts() {
    return {
      /**
       * Convert code architecture to diagram
       */
      codeToArchitecture: (codeContext: string) => `
Analyze the provided code and create an architecture diagram showing:

Code Context:
${codeContext}

Please create a draw.io XML diagram that shows:
1. Main components and modules
2. Dependencies between components
3. Data flow and interactions
4. External integrations
5. Layer separation (if applicable)

Use rectangles for components, arrows for dependencies, and group related elements.
Output only the draw.io XML.`,

      /**
       * Process documentation to flowchart
       */
      processToFlowchart: (processDescription: string) => `
Convert this process description into a flowchart:

Process: ${processDescription}

Create a flowchart that shows:
1. Start and end points
2. All process steps in sequence
3. Decision points with Yes/No branches
4. Parallel processes if applicable
5. Exception handling paths

Use standard flowchart symbols and clear connections.
Output only the draw.io XML.`,

      /**
       * API documentation to sequence diagram
       */
      apiToSequence: (apiSpec: string) => `
Create a sequence diagram from this API specification:

API Specification: ${apiSpec}

Show:
1. Client and server interactions
2. Request/response flow
3. Authentication steps
4. Error handling
5. Third-party service calls

Use proper sequence diagram notation with actors, lifelines, and messages.
Output only the draw.io XML.`
    };
  }
}

export default PromptBuilder;