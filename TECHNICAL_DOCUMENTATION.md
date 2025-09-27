# Staicy - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Database Schema](#database-schema)
6. [AI Services](#ai-services)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)
9. [Development Guide](#development-guide)

---

## System Overview

**Staicy** is an intelligent, AI-powered documentation system that automates the creation, maintenance, and collaboration of technical documentation. The system leverages advanced AI models (OpenAI GPT-4, Claude 3.7) to generate documentation from code, create diagrams from natural language, and provide intelligent suggestions for content improvement.

### Core Capabilities
- **AI-Powered Documentation Generation**: Convert code to comprehensive documentation
- **Intelligent Diagram Creation**: Generate professional diagrams from text descriptions
- **Real-time Collaboration**: Multi-user editing with live synchronization
- **Advanced AI Integration**: Claude 3.7 for Draw.io XML generation, GPT-4 for content
- **Team Management**: Role-based access control and collaborative workflows

---

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • OpenAI API    │
│ • TypeScript    │    │ • TypeScript    │    │ • Claude API    │
│ • Tailwind CSS  │    │ • Prisma ORM    │    │ • AWS S3        │
│ • Socket.io     │    │ • Socket.io     │    │ • Redis         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────────────────────┐
                                 │                               │
                    ┌─────────────────┐              ┌─────────────────┐
                    │   PostgreSQL    │              │   Draw.io       │
                    │   Database      │              │   Integration   │
                    │                 │              │                 │
                    │ • Users         │              │ • XML Generation│
                    │ • Documents     │              │ • Diagram Editor│
                    │ • Diagrams      │              │ • Real-time Sync│
                    │ • Teams         │              │                 │
                    └─────────────────┘              └─────────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with custom middleware
- **Real-time**: Socket.io for collaboration
- **AI Services**: OpenAI GPT-4, Anthropic Claude 3.7
- **File Storage**: AWS S3 integration
- **Caching**: Redis for session management

#### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + custom hooks
- **Routing**: React Router v6
- **Real-time**: Socket.io client
- **Rich Text**: TipTap editor integration
- **Diagrams**: Draw.io embedded editor
- **Build Tool**: Vite

---

## Backend Documentation

### Project Structure
```
backend/
├── src/
│   ├── api/                    # API route handlers
│   │   ├── auth/              # Authentication endpoints
│   │   ├── documents/         # Document CRUD operations
│   │   ├── diagrams/          # Diagram generation and management
│   │   ├── integrations/      # External service integrations
│   │   └── ai/                # AI service endpoints
│   ├── services/              # Business logic services
│   │   ├── aiService.ts       # OpenAI/Claude integration
│   │   ├── diagramService.ts  # Mermaid/PlantUML processing
│   │   ├── advancedDiagramService.ts # Draw.io specialized operations
│   │   ├── integrationService.ts # External API management
│   │   └── collaborationService.ts # Real-time collaboration
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts   # Error handling
│   │   └── validation.ts     # Request validation
│   ├── types/                # TypeScript type definitions
│   └── index.ts              # Application entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Core Services

#### 1. AI Service (`aiService.ts`)
**Purpose**: Central AI integration service handling OpenAI GPT-4 and Anthropic Claude 3.7 interactions.

**Key Methods**:
- `generateDocumentFromCode()`: Converts code to structured documentation
- `createDiagramFromText()`: Generates Mermaid diagrams from text
- `generateDrawIODiagram()`: Creates Draw.io XML using Claude 3.7
- `generateDiagramFromImage()`: Analyzes images and creates diagrams
- `refineDiagram()`: Modifies existing Draw.io diagrams
- `suggestImprovements()`: AI-powered content suggestions
- `extractWorkflowFromDiagram()`: Converts diagrams to text descriptions
- `generateUMLFromNaturalLanguage()`: Creates PlantUML from specifications
- `autoCompleteDocument()`: Intelligent content completion

**Technical Details**:
- Uses Claude 3.7 Sonnet for Draw.io XML generation with specialized prompts
- Implements XML validation and correction mechanisms
- Provides confidence scoring for generated content
- Handles both text-to-diagram and image-to-diagram workflows

#### 2. Diagram Service (`diagramService.ts`)
**Purpose**: Manages diagram operations including Mermaid, PlantUML, and Draw.io formats.

**Key Methods**:
- `generateMermaidDiagram()`: Creates Mermaid diagrams
- `generatePlantUMLDiagram()`: Generates PlantUML diagrams
- `convertToDrawIO()`: Converts between diagram formats
- `validateDiagram()`: Validates diagram syntax and structure
- `exportDiagram()`: Exports diagrams in various formats

#### 3. Advanced Diagram Service (`advancedDiagramService.ts`)
**Purpose**: Specialized operations for Draw.io diagram generation and manipulation.

**Key Methods**:
- `generateInfrastructureDiagram()`: Creates AWS/cloud architecture diagrams
- `generateProcessFlowchart()`: Generates business process flows
- `generateSequenceDiagram()`: Creates interaction diagrams
- `generateNetworkDiagram()`: Creates network topology diagrams
- `analyzeDiagram()`: Analyzes diagram structure and elements
- `optimizeDiagram()`: Optimizes diagram layout and performance
- `convertDiagramFormat()`: Converts between diagram formats

#### 4. Collaboration Service (`collaborationService.ts`)
**Purpose**: Handles real-time collaboration features using Socket.io.

**Key Methods**:
- `joinDocument()`: User joins document collaboration
- `leaveDocument()`: User leaves document collaboration
- `handleCursorUpdate()`: Real-time cursor position updates
- `handleContentChange()`: Live content synchronization
- `handleUserPresence()`: User presence management

### Authentication & Authorization

#### JWT Authentication (`middleware/auth.ts`)
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  teams: TeamMember[];
}
```

**Features**:
- JWT token validation
- Role-based access control
- Team membership verification
- Request user context injection

#### Error Handling (`middleware/errorHandler.ts`)
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
```

**Features**:
- Centralized error handling
- Operational vs programming error distinction
- Error logging and monitoring
- User-friendly error responses

### Database Schema

#### Core Entities

**User Model**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(VIEWER)
  teams     TeamMember[]
  documents Document[]
  diagrams  Diagram[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Document Model**:
```prisma
model Document {
  id          String    @id @default(cuid())
  title       String
  content     Json      // Rich text content
  type        DocType
  status      DocStatus @default(DRAFT)
  teamId      String
  team        Team      @relation(fields: [teamId], references: [id])
  createdBy   String
  creator     User      @relation(fields: [createdBy], references: [id])
  diagrams    Diagram[]
  comments    Comment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Diagram Model**:
```prisma
model Diagram {
  id          String     @id @default(cuid())
  title       String
  type        DiagramType
  content     Json       // Diagram content (Mermaid, PlantUML, Draw.io XML)
  isGenerated Boolean    @default(false)
  documentId  String?
  document    Document?  @relation(fields: [documentId], references: [id])
  createdBy   String
  creator     User       @relation(fields: [createdBy], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

## Frontend Documentation

### Project Structure
```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Layout.tsx        # Main application layout
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── Header.tsx        # Application header
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── pages/                # Route components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── DocumentList.tsx  # Document management
│   │   ├── DocumentEditor.tsx # Rich text editor
│   │   ├── DiagramStudio.tsx # Draw.io integration
│   │   ├── TeamManagement.tsx # Team administration
│   │   └── IntegrationsPanel.tsx # External integrations
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── CollaborationContext.tsx # Real-time collaboration
│   ├── services/             # API client services
│   │   ├── api.ts           # Axios configuration
│   │   ├── authService.ts   # Authentication API calls
│   │   └── documentService.ts # Document API calls
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile
```

### Key Components

#### 1. Diagram Studio (`DiagramStudio.tsx`)
**Purpose**: Advanced diagram creation interface with Draw.io integration and AI chat.

**Features**:
- **Draw.io Integration**: Embedded Draw.io editor with full functionality
- **AI Chat Interface**: Real-time conversation with AI for diagram generation
- **Image Upload**: Convert images to editable diagrams
- **Diagram Refinement**: Modify existing diagrams through natural language
- **Live XML Loading**: Generated diagrams automatically load into Draw.io

**Technical Implementation**:
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

// Draw.io iframe integration
<iframe
  ref={drawioRef}
  src="https://app.diagrams.net/?embed=1&ui=kennedy&spin=1&modified=unsavedChanges&proto=json&noSaveBtn=1&saveAndExit=0&lang=en"
  className="w-full h-full border-0"
  title="Draw.io Editor"
  allow="clipboard-read; clipboard-write"
/>
```

#### 2. Authentication Context (`AuthContext.tsx`)
**Purpose**: Manages authentication state and user session.

**Features**:
- JWT token management
- User profile management
- Team membership tracking
- Automatic token refresh
- Demo mode support

#### 3. Collaboration Context (`CollaborationContext.tsx`)
**Purpose**: Handles real-time collaboration features.

**Features**:
- Socket.io connection management
- Live cursor tracking
- Document synchronization
- User presence indicators
- Conflict resolution

### State Management

#### Context-Based Architecture
- **AuthContext**: User authentication and authorization
- **CollaborationContext**: Real-time collaboration features
- **Local State**: Component-level state with React hooks

#### API Integration
```typescript
// API service configuration
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request/response interceptors for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## AI Services

### OpenAI GPT-4 Integration
**Purpose**: Content generation, improvement suggestions, and natural language processing.

**Use Cases**:
- Document generation from code
- Content improvement suggestions
- Natural language to diagram conversion
- Workflow extraction from diagrams
- UML generation from specifications

**Configuration**:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Example usage
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are an expert technical writer..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.3,
  max_tokens: 4000
});
```

### Anthropic Claude 3.7 Integration
**Purpose**: Advanced diagram generation, image analysis, and Draw.io XML creation.

**Use Cases**:
- Draw.io XML generation from natural language
- Image-to-diagram conversion
- Diagram refinement and modification
- Complex architectural diagram creation

**Configuration**:
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Example usage
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
```

### AI Prompt Engineering

#### Draw.io System Prompt
```typescript
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
- Follow draw.io XML schema exactly`;
}
```

#### XML Validation and Correction
```typescript
private async validateAndCorrectXML(xml: string): Promise<string> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return this.fixCommonXMLIssues(xml);
    }
    
    return xml;
  } catch (error) {
    return this.fixCommonXMLIssues(xml);
  }
}
```

---

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/me          # Get current user
PUT    /api/auth/profile     # Update user profile
```

### Document Endpoints
```
GET    /api/documents                    # List documents
POST   /api/documents                    # Create document
GET    /api/documents/:id                # Get document
PUT    /api/documents/:id                # Update document
DELETE /api/documents/:id                 # Delete document
POST   /api/documents/:id/ai/suggestions # Get AI suggestions
POST   /api/documents/generate-from-code  # Generate from code
```

### Diagram Endpoints
```
GET    /api/diagrams                      # List diagrams
POST   /api/diagrams                     # Create diagram
GET    /api/diagrams/:id                  # Get diagram
PUT    /api/diagrams/:id                  # Update diagram
DELETE /api/diagrams/:id                  # Delete diagram
POST   /api/diagrams/generate             # Generate diagram
POST   /api/diagrams/text-to-diagram      # Convert text to diagram
POST   /api/diagrams/diagram-to-text       # Convert diagram to text
```

### Advanced Diagram Endpoints
```
POST   /api/diagrams/generate-drawio      # Generate Draw.io diagram
POST   /api/diagrams/refine-diagram       # Refine existing diagram
POST   /api/diagrams/image-to-diagram     # Generate from image
POST   /api/diagrams/generate-infrastructure # Infrastructure diagrams
POST   /api/diagrams/generate-process-flow # Process flowcharts
POST   /api/diagrams/generate-sequence    # Sequence diagrams
POST   /api/diagrams/generate-network     # Network diagrams
POST   /api/diagrams/analyze              # Analyze diagram
POST   /api/diagrams/optimize             # Optimize diagram
POST   /api/diagrams/convert-format       # Convert format
```

### AI Endpoints
```
POST   /api/ai/generate-document          # Generate document
POST   /api/ai/suggest-improvements       # Get improvement suggestions
POST   /api/ai/auto-complete              # Auto-complete content
POST   /api/ai/extract-workflow           # Extract workflow from diagram
POST   /api/ai/generate-uml              # Generate UML from specs
```

---

## Database Schema

### Entity Relationships
```
User (1) ──── (N) TeamMember (N) ──── (1) Team
User (1) ──── (N) Document
User (1) ──── (N) Diagram
Team (1) ──── (N) Document
Document (1) ──── (N) Diagram
Document (1) ──── (N) Comment
```

### Enums
```prisma
enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum DocType {
  API_REFERENCE
  ARCHITECTURE
  SPECIFICATION
  PROCESS
  REQUIREMENTS
  GUIDE
}

enum DocStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum DiagramType {
  FLOWCHART
  SEQUENCE
  CLASS
  ER
  ARCHITECTURE
  NETWORK
}
```

---

## Deployment

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: staicy
      POSTGRES_USER: staicy
      POSTGRES_PASSWORD: staicy_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://staicy:staicy_password@postgres:5432/staicy
      - REDIS_URL=redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/staicy"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# External Services
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket"
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=3001
```

#### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3001"
VITE_APP_NAME="Staicy"
VITE_APP_VERSION="1.0.0"
```

---

## Development Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key
- Anthropic API key

### Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/your-org/staicy.git
cd staicy
```

2. **Install Dependencies**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. **Environment Configuration**
```bash
cp backend/env.example backend/.env
# Configure your environment variables
```

4. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Start Development**
```bash
# From root directory
npm run dev

# Or individually
cd backend && npm run dev
cd frontend && npm run dev
```

### Development Scripts

#### Root Level
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
  "dev:backend": "cd backend && npm run dev",
  "dev:frontend": "cd frontend && npm run dev",
  "build": "npm run build:backend && npm run build:frontend",
  "test": "npm run test:backend && npm run test:frontend"
}
```

#### Backend Scripts
```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:seed": "prisma db seed",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

#### Frontend Scripts
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

### Code Quality

#### TypeScript Configuration
- Strict mode enabled
- Path mapping for clean imports
- ESLint and Prettier integration
- Type checking in CI/CD

#### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- AI service mocking for consistent testing

#### Performance Optimization
- Database query optimization
- Redis caching for frequent operations
- Image optimization and CDN integration
- Code splitting and lazy loading

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with secure secrets
- Role-based access control (RBAC)
- Team-based document permissions
- API rate limiting

### Data Protection
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- XSS protection in frontend
- CORS configuration

### AI Service Security
- API key management
- Request/response logging
- Content filtering and validation
- Rate limiting for AI endpoints

---

## Monitoring & Logging

### Application Monitoring
- Error tracking and alerting
- Performance metrics
- User activity logging
- AI service usage tracking

### Database Monitoring
- Query performance analysis
- Connection pool monitoring
- Backup and recovery procedures
- Data integrity checks

---

## Future Enhancements

### Planned Features
- Advanced collaboration features (comments, suggestions)
- Real-time document versioning
- Advanced AI model fine-tuning
- Mobile application support
- Enterprise SSO integration

### Technical Improvements
- Microservices architecture migration
- Advanced caching strategies
- Real-time analytics dashboard
- Automated testing pipeline
- Performance optimization

---

This documentation provides a comprehensive technical overview of the Staicy codebase. For specific implementation details, refer to the individual source files and their inline documentation.
