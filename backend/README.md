# GenAI Draw.io Backend

A powerful GenAI-powered backend service for generating Draw.io compatible diagrams using Claude/AWS Bedrock.

## 🚀 Features

- **AI-Powered Diagram Generation**: Generate professional diagrams from natural language descriptions
- **Multiple Diagram Types**: Support for flowcharts, sequence diagrams, class diagrams, ER diagrams, architecture diagrams, and more
- **XML Validation & Correction**: Automatic validation and correction of Draw.io XML format
- **Image-to-Diagram**: Convert images to diagrams using AI vision capabilities
- **Diagram Refinement**: Modify existing diagrams based on user feedback
- **Type Conversion**: Convert between different diagram types
- **RESTful API**: Clean, well-documented REST API endpoints

## 📁 Project Structure

```
genai-drawio-backend/
│
├─ package.json                 # Dependencies and scripts
├─ tsconfig.json               # TypeScript configuration
├─ .env                        # Environment variables (API keys, config)
├─ src/
│   ├─ server.ts              # Main server entry point
│   ├─ utils/
│   │   ├─ xmlValidator.ts    # Draw.io XML validation and correction
│   │   └─ promptBuilder.ts   # LLM prompt construction utilities
│   ├─ routes/
│   │   └─ diagram.ts         # API endpoints for diagram operations
│   └─ models/
│       ├─ DiagramStorage.ts  # Data models for diagram logging
│       └─ index.ts           # Model exports
└─ README.md                  # This file
```

## 🛠 Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env` and update with your API keys:
   ```bash
   # Required: Anthropic Claude API Key
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   
   # Or AWS Bedrock credentials
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   ```

3. **Build and start:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Generate Diagram
```http
POST /api/diagrams/generate
Content-Type: application/json

{
  "type": "flowchart",
  "description": "User registration process with email verification",
  "context": "Web application flow",
  "style": "professional",
  "complexity": "moderate"
}
```

### Refine Existing Diagram
```http
POST /api/diagrams/refine
Content-Type: application/json

{
  "existingXML": "<mxfile>...</mxfile>",
  "changes": "Add error handling branch",
  "type": "flowchart"
}
```

### Generate from Image
```http
POST /api/diagrams/from-image
Content-Type: application/json

{
  "imageUrl": "https://example.com/diagram.png",
  "type": "flowchart",
  "description": "Convert this whiteboard sketch"
}
```

### Validate XML
```http
POST /api/diagrams/validate
Content-Type: application/json

{
  "xml": "<mxfile>...</mxfile>"
}
```

### Get Supported Types
```http
GET /api/diagrams/types
```

## 🎨 Supported Diagram Types

- **flowchart**: Process flow diagrams with decision points
- **sequence**: Interaction diagrams showing message exchanges
- **class**: Object-oriented class diagrams with relationships
- **er**: Entity-relationship diagrams for database design
- **architecture**: System architecture and component diagrams
- **network**: Network topology and infrastructure diagrams
- **mindmap**: Hierarchical mind maps for organization
- **org-chart**: Organizational charts showing hierarchies
- **timeline**: Timeline diagrams for project planning
- **wireframe**: UI/UX wireframes and mockups

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic Claude API key |
| `AWS_ACCESS_KEY_ID` | Yes* | AWS access key for Bedrock |
| `AWS_SECRET_ACCESS_KEY` | Yes* | AWS secret key for Bedrock |
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:3000) |

*Either Anthropic or AWS credentials required

### Diagram Styles

- **minimal**: Clean and simple
- **detailed**: Comprehensive with annotations
- **professional**: Corporate styling
- **creative**: Visually appealing and modern

### Complexity Levels

- **simple**: 3-7 main components, basic relationships
- **moderate**: 5-15 components with supporting details
- **complex**: 10+ elements with comprehensive details

## 🧪 Usage Examples

### Basic Flowchart Generation

```javascript
const response = await fetch('/api/diagrams/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'flowchart',
    description: 'E-commerce checkout process with payment gateway integration',
    style: 'professional',
    complexity: 'moderate'
  })
});

const { xml, metadata } = await response.json();
// xml contains Draw.io compatible XML
// metadata contains validation info and element count
```

### Architecture Diagram from Code

```javascript
const response = await fetch('/api/diagrams/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'architecture',
    description: 'Microservices architecture with API gateway, auth service, user service, and database',
    context: 'Cloud-native application with Docker containers',
    complexity: 'complex'
  })
});
```

## 🔍 Error Handling

The API provides comprehensive error handling with detailed messages:

```json
{
  "error": "Generation failed",
  "message": "Invalid diagram type specified",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 📊 Monitoring

Health check endpoint:
```http
GET /health
```

Returns server status and configuration information.

## 🚀 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### TypeScript

The project uses strict TypeScript configuration with comprehensive type checking and modern ES features.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the error messages and logs