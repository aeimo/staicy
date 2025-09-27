import { useState, useRef, useEffect } from 'react'
import { 
  Send,
  Upload,
  Loader2,
  FileText,
  Download
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isGenerating?: boolean
}

export const LandingPage: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [diagramXML, setDiagramXML] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const drawioRef = useRef<HTMLIFrameElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send diagram XML to Draw.io when it changes
  useEffect(() => {
    if (diagramXML && drawioRef.current) {
      const iframe = drawioRef.current
      iframe.contentWindow?.postMessage({
        action: 'load',
        xml: diagramXML
      }, '*')
    }
  }, [diagramXML])

  const handleSendMessage = async () => {
    if (!userPrompt.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userPrompt,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserPrompt('')
    setIsGenerating(true)
    setShowChatHistory(true)

    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    // Simulate AI processing with hardcoded response
    setTimeout(() => {
      const aiResponse = getHardcodedResponse(userPrompt)
      setDiagramXML(getHardcodedDiagram())
      
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? {
              ...msg,
              content: aiResponse,
              isGenerating: false
            }
          : msg
      ))
      setIsGenerating(false)
    }, 2000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)
    setShowChatHistory(true)

    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    // Simulate codebase analysis
    setTimeout(() => {
      setDiagramXML(getHardcodedDiagram())
      
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? {
              ...msg,
              content: `I've analyzed your codebase and generated an architecture diagram. The diagram shows the system structure with components, relationships, and data flow.`,
              isGenerating: false
            }
          : msg
      ))
      setIsGenerating(false)
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage()
    }
  }

  const getHardcodedResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('login') || lowerPrompt.includes('auth')) {
      return "I've created a user authentication flow diagram showing the login process, including user input validation, credential verification, session management, and security measures. The diagram illustrates the complete authentication workflow from user interaction to system response."
    } else if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint')) {
      return "I've generated an API architecture diagram that shows the REST endpoints, request/response flow, middleware layers, database connections, and error handling. The diagram includes authentication, rate limiting, and response formatting components."
    } else if (lowerPrompt.includes('database') || lowerPrompt.includes('db')) {
      return "I've created a database architecture diagram showing the data model, relationships between tables, indexing strategies, and query optimization. The diagram includes primary keys, foreign keys, and data flow patterns."
    } else if (lowerPrompt.includes('microservice') || lowerPrompt.includes('service')) {
      return "I've generated a microservices architecture diagram showing service boundaries, inter-service communication, API gateways, load balancers, and data consistency patterns. The diagram illustrates how services interact and maintain system integrity."
    } else {
      return "I've created a comprehensive system architecture diagram based on your requirements. The diagram shows the main components, their relationships, data flow, and integration points. This provides a clear overview of the system structure and how different parts work together."
    }
  }

  const getHardcodedDiagram = (): string => {
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

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Side - Chat History with Input (shown after first prompt) */}
      {showChatHistory && (
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input at bottom of left panel */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Upload codebase files"
              >
                <Upload className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.fs,.vb,.sql,.html,.css,.scss,.less,.xml,.json,.yaml,.yml,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex-1">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Continue the conversation..."
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!userPrompt.trim() || isGenerating}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Press Cmd/Ctrl + Enter to send
            </div>
          </div>
        </div>
      )}

      {/* Center - Main Chat Area (only shown when no chat history) */}
      <div className={`flex-1 flex flex-col ${showChatHistory ? 'hidden' : 'max-w-4xl mx-auto'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Staicy</h1>
            <div className="text-sm text-gray-500">
              AI-Powered Documentation & Diagram Generation
            </div>
          </div>
        </div>

        {/* Main Content - Only shown when no chat history */}
        <div className="flex-1 flex flex-col justify-center items-center px-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Staicy
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Describe what you want to build or upload your codebase, and I'll generate documentation and diagrams for you.
              </p>
            </div>

            {/* Large Chat Input */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Upload codebase files"
                >
                  <Upload className="h-6 w-6" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.fs,.vb,.sql,.html,.css,.scss,.less,.xml,.json,.yaml,.yml,.md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex-1">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you want to build... (e.g., 'Create a user authentication system' or 'Design a REST API architecture')"
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    rows={4}
                    disabled={isGenerating}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!userPrompt.trim() || isGenerating}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mt-3 text-center">
                Press Cmd/Ctrl + Enter to send • Upload code files for automatic analysis
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Draw.io Panel (spans rest of screen) */}
      {showChatHistory && (
        <div className="flex-1 border-l border-gray-200 bg-white flex flex-col">
          {/* Diagram Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Diagram Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {/* Download functionality */}}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Download diagram"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Draw.io Editor */}
          <div className="flex-1">
            {diagramXML ? (
              <iframe
                ref={drawioRef}
                src="https://app.diagrams.net/?embed=1&ui=kennedy&spin=1&modified=unsavedChanges&proto=json&noSaveBtn=1&saveAndExit=0&lang=en"
                className="w-full h-full border-0"
                title="Draw.io Editor"
                allow="clipboard-read; clipboard-write"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No diagram generated yet</p>
                  <p className="text-sm">Start a conversation to see your diagram here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
