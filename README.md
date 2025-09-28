# Staicy - Intelligent Documentation System

An AI-powered documentation platform that helps teams capture knowledge, generate diagrams, and maintain living documents with real-time collaboration features.

## 🚀 Features

### Core Features
- **AI-Powered Documentation**: Generate documentation (flowcharts, uml, eerd) from code, natural language, and existing content
- **Real-time Collaboration**: Live editing with file upload, initial prompt, and back and forth chat with LLM.
- **Intelligent Diagrams**: Auto-generate flowcharts, sequence diagrams, and architecture diagrams
- **Rich Text Editor**: Advanced editing with AI suggestions and auto-updating xml files
- **Preview of Drawing**: Real preview of Draw.io drawing shown right in the chat web page.

### AI Capabilities
- **Code to Documentation**: Automatically generate docs from code repositories
- **Natural Language Processing**: Convert descriptions to structured documentation
- **Smart Suggestions**: AI-powered improvements and content recommendations
- **Diagram Generation**: Create visual diagrams from text descriptions
- **Content Optimization**: Ability to collaborate and discuss changes to diagrams with LLM

## 🏗️ Architecture

### Backend (Node.js/Express + TypeScript)
```
backend/
├── src/              # Setup code
├── routes/           # Frontend to Backend communication
├── models/           # Database models
├── node_modules/     # modules
└── utils/            # Utility functions
```

### Frontend (React + TypeScript)
```
src/
├── components/        # Reusable UI components
├── pages/             # Route components
├── contexts/          # React contexts (Auth, Collaboration)
├── services/          # API client services
├── types/             # TypeScript type definitions
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth
- **AI Services**: Gemini 2.5-flash
- **Caching**: Redis for session management

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Zustand
- **Routing**: React Router v6
- **Rich Text**: TipTap editor with collaboration
- **Diagrams**: Mermaid.js integration
- **Build Tool**: Vite

### AI & ML
- **Gemini API**: Document generation and improvement
- **OpenAI API**: Alternative AI provider
- **Mermaid.js**: Diagram generation and rendering
- **PlantUML**: UML diagram support
- **Natural Language Processing**: Content analysis and suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional, for caching)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/staicy.git
cd staicy
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your environment variables
# See backend/env.example for required variables
```

5. **Start Development Servers**
```bash
# From the root directory
npm run dev

# Setup Backend (port 5001)
cd backend && npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Document Endpoints
- `GET /api/documents` - List documents with filtering
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/ai/suggestions` - Get AI suggestions
- `POST /api/documents/generate-from-code` - Generate from code

### Diagram Endpoints
- `GET /api/diagrams` - List diagrams
- `POST /api/diagrams` - Create diagram
- `POST /api/diagrams/generate` - AI generate diagram
- `POST /api/diagrams/text-to-diagram` - Convert text to diagram
- `POST /api/diagrams/diagram-to-text` - Extract text from diagram

### Integration Endpoints
- `GET /api/integrations` - List integrations
- `POST /api/integrations` - Create integration
- `POST /api/integrations/github/sync` - Sync with GitHub
- `POST /api/integrations/slack/webhook` - Slack webhook
- `POST /api/integrations/confluence/sync` - Confluence sync

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/staicy"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="staicy-documents"

# Redis
REDIS_URL="redis://localhost:6379"

# External Integrations
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001"
VITE_APP_NAME="Staicy"
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t staicy-backend ./backend
docker build -t staicy-frontend ./frontend
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment-Specific Configs
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Gemini for Gemini-2.5-flash
- Mermaid.js for diagram generation
- Draw.io for hosting diagrams with xmls
- Prisma for database management

## 📞 Support

- **Documentation**: [docs.staicy.com](https://docs.staicy.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/staicy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/staicy/discussions)
- **Email**: support@staicy.com

---

Built with ❤️ by the Staicy Team
