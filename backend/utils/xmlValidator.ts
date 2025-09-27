import { parseString, Builder } from 'xml2js';
import { XMLParser, XMLValidator as FastXMLValidator } from 'fast-xml-parser';

export interface DiagramValidationResult {
  isValid: boolean;
  errors: string[];
  correctedXML?: string;
  elementCount: number;
}

/**
 * Validates and corrects Draw.io XML format
 */
export class XMLValidator {
  private static parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    parseTagValue: true
  });

  /**
   * Validates Draw.io XML and attempts to fix common issues
   */
  static async validate(xmlContent: string): Promise<DiagramValidationResult> {
    const result: DiagramValidationResult = {
      isValid: false,
      errors: [],
      elementCount: 0
    };

    try {
      // Basic XML validation
      const isValidXML = FastXMLValidator.validate(xmlContent);
      if (isValidXML !== true) {
        result.errors.push('Invalid XML structure');
        // Try to fix and re-validate
        const fixedXML = this.fixCommonXMLIssues(xmlContent);
        const isFixedValid = FastXMLValidator.validate(fixedXML);
        if (isFixedValid === true) {
          result.correctedXML = fixedXML;
          xmlContent = fixedXML;
        } else {
          return result;
        }
      }

      // Parse XML
      const parsedXML = this.parser.parse(xmlContent);
      
      // Validate Draw.io structure
      const structureValidation = this.validateDrawIOStructure(parsedXML);
      result.errors.push(...structureValidation.errors);
      result.elementCount = structureValidation.elementCount;

      if (structureValidation.errors.length === 0) {
        result.isValid = true;
      }

      // If there are structural issues, try to correct them
      if (!result.isValid && structureValidation.errors.length > 0) {
        const correctedXML = await this.correctDrawIOStructure(xmlContent, parsedXML);
        if (correctedXML) {
          result.correctedXML = correctedXML;
          result.isValid = true;
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  /**
   * Fix common XML formatting issues
   */
  private static fixCommonXMLIssues(xml: string): string {
    let fixed = xml;

    // Remove any leading/trailing whitespace
    fixed = fixed.trim();

    // Ensure XML declaration is present
    if (!fixed.startsWith('<?xml')) {
      fixed = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixed;
    }

    // Fix unescaped characters in attribute values
    fixed = fixed.replace(/(?<=")([^"]*?)&(?![a-zA-Z0-9#]{1,10};)([^"]*?)(?=")/g, '$1&amp;$2');
    fixed = fixed.replace(/(?<=")([^"]*?)<(?![/!?a-zA-Z])([^"]*?)(?=")/g, '$1&lt;$2');
    fixed = fixed.replace(/(?<=")([^"]*?)>(?![^<]*<)([^"]*?)(?=")/g, '$1&gt;$2');

    // Fix self-closing tags that should be properly closed
    const selfClosingTags = ['mxCell', 'mxGeometry', 'mxPoint'];
    for (const tag of selfClosingTags) {
      const regex = new RegExp(`<${tag}([^>]*?)>`, 'g');
      fixed = fixed.replace(regex, (match, attributes) => {
        if (!match.endsWith('/>')) {
          return `<${tag}${attributes}/>`;
        }
        return match;
      });
    }

    return fixed;
  }

  /**
   * Validate Draw.io specific structure
   */
  private static validateDrawIOStructure(parsedXML: any): { errors: string[]; elementCount: number } {
    const errors: string[] = [];
    let elementCount = 0;

    try {
      // Check for mxfile root
      if (!parsedXML.mxfile) {
        errors.push('Missing mxfile root element');
        return { errors, elementCount };
      }

      // Check for diagram element
      const mxfile = parsedXML.mxfile;
      if (!mxfile.diagram) {
        errors.push('Missing diagram element');
        return { errors, elementCount };
      }

      // Check for mxGraphModel
      const diagram = Array.isArray(mxfile.diagram) ? mxfile.diagram[0] : mxfile.diagram;
      if (!diagram.mxGraphModel) {
        errors.push('Missing mxGraphModel element');
        return { errors, elementCount };
      }

      // Check for root element
      const graphModel = diagram.mxGraphModel;
      if (!graphModel.root) {
        errors.push('Missing root element in mxGraphModel');
        return { errors, elementCount };
      }

      // Count mxCell elements
      const root = graphModel.root;
      if (root.mxCell) {
        if (Array.isArray(root.mxCell)) {
          elementCount = root.mxCell.length;
        } else {
          elementCount = 1;
        }
      }

      // Validate that we have at least the default cells (id="0" and id="1")
      if (elementCount < 2) {
        errors.push('Missing required default cells (id="0" and id="1")');
      }

    } catch (error) {
      errors.push(`Structure validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, elementCount };
  }

  /**
   * Attempt to correct Draw.io structure issues
   */
  private static async correctDrawIOStructure(originalXML: string, parsedXML: any): Promise<string | null> {
    try {
      // Create a minimal valid Draw.io structure
      const correctedStructure = {
        mxfile: {
          $: {
            host: 'app.diagrams.net',
            modified: new Date().toISOString(),
            agent: 'genai-drawio-backend',
            version: '21.7.5',
            etag: 'generated'
          },
          diagram: {
            $: {
              id: 'generated-diagram',
              name: 'Generated Diagram'
            },
            mxGraphModel: {
              $: {
                dx: '1422',
                dy: '794',
                grid: '1',
                gridSize: '10',
                guides: '1',
                tooltips: '1',
                connect: '1',
                arrows: '1',
                fold: '1',
                page: '1',
                pageScale: '1',
                pageWidth: '827',
                pageHeight: '1169',
                math: '0',
                shadow: '0'
              },
              root: {
                mxCell: [
                  {
                    $: { id: '0' }
                  },
                  {
                    $: { id: '1', parent: '0' }
                  }
                ]
              }
            }
          }
        }
      };

      // Try to merge existing content
      if (parsedXML && parsedXML.mxfile && parsedXML.mxfile.diagram) {
        const existingDiagram = Array.isArray(parsedXML.mxfile.diagram) 
          ? parsedXML.mxfile.diagram[0] 
          : parsedXML.mxfile.diagram;

        if (existingDiagram.mxGraphModel && existingDiagram.mxGraphModel.root && existingDiagram.mxGraphModel.root.mxCell) {
          const existingCells = Array.isArray(existingDiagram.mxGraphModel.root.mxCell) 
            ? existingDiagram.mxGraphModel.root.mxCell 
            : [existingDiagram.mxGraphModel.root.mxCell];

          // Filter out cells that might conflict with defaults
          const validCells = existingCells.filter((cell: any) => 
            cell.$ && cell.$.id && cell.$.id !== '0' && cell.$.id !== '1'
          );

          // Add valid existing cells to our structure
          correctedStructure.mxfile.diagram.mxGraphModel.root.mxCell.push(...validCells);
        }
      }

      // Convert back to XML
      const builder = new Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty: true, indent: '  ', newline: '\n' }
      });

      return builder.buildObject(correctedStructure);
    } catch (error) {
      console.error('Error correcting Draw.io structure:', error);
      return null;
    }
  }

  /**
   * Extract basic information from Draw.io XML
   */
  static extractDiagramInfo(xmlContent: string): {
    title?: string;
    elementCount: number;
    bounds?: { width: number; height: number };
  } {
    try {
      const parsedXML = this.parser.parse(xmlContent);
      const result: {
        title?: string;
        elementCount: number;
        bounds: { width: number; height: number };
      } = {
        elementCount: 0,
        bounds: { width: 827, height: 1169 } // default Draw.io page size
      };

      if (parsedXML.mxfile?.diagram) {
        const diagram = Array.isArray(parsedXML.mxfile.diagram) 
          ? parsedXML.mxfile.diagram[0] 
          : parsedXML.mxfile.diagram;

        // Extract title
        if (diagram.$?.name) {
          result.title = diagram.$.name;
        }

        // Count elements
        if (diagram.mxGraphModel?.root?.mxCell) {
          const cells = Array.isArray(diagram.mxGraphModel.root.mxCell) 
            ? diagram.mxGraphModel.root.mxCell 
            : [diagram.mxGraphModel.root.mxCell];
          result.elementCount = cells.length;
        }

        // Extract bounds
        if (diagram.mxGraphModel?.$) {
          const pageWidth = parseInt(diagram.mxGraphModel.$.pageWidth) || 827;
          const pageHeight = parseInt(diagram.mxGraphModel.$.pageHeight) || 1169;
          result.bounds = { width: pageWidth, height: pageHeight };
        }
      }

      return result;
    } catch (error) {
      console.error('Error extracting diagram info:', error);
      return { elementCount: 0, bounds: { width: 827, height: 1169 } };
    }
  }
}

export default XMLValidator;