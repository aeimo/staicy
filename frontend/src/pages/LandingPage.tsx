import { useState, useRef, useEffect } from 'react'
import { 
  Send,
  Upload,
  Loader2,
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<{ name: string; content: string }[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Draw.io Integration
  const [iframeKey, setIframeKey] = useState(0)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const updateStatus = (status: string) => {
    const statusElement = document.getElementById('editor-status')
    if (statusElement) {
      statusElement.textContent = status
    }
  }

   const refreshIframe = () => {
     setIsRefreshing(true)
     setIframeKey(prev => prev + 1)
     updateStatus('Refreshing diagram...')
  }

  const handleGoHome = () => {
    setShowChatHistory(false)
    setMessages([])
    setUserPrompt('')
    setFiles([]) // ✅ clear files on reset
  }

  // ✅ New unified function
  const SendMessages = async () => {
    if ((!userPrompt.trim() && files.length === 0) || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userPrompt,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setUserPrompt('')
    setIsGenerating(true)
    setShowChatHistory(true)

    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true,
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      // If you need to send files as FormData:
      // const formData = new FormData();
      // formData.append("prompt", userPrompt);
      // files.forEach(f => formData.append("files", f));

      const response = await fetch('http://localhost:5001/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          files: files, // ✅ full file objects with content
        }),
      })

      const data = await response.json()

      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessage.id
            ? { ...msg, content: data.content, isGenerating: false }
            : msg
        )
      )
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessage.id
            ? { ...msg, content: 'Error connecting to server.', isGenerating: false }
            : msg
        )
      )
    } finally {
      refreshIframe()
      setIsGenerating(false)
      setFiles([]) // ✅ clear files after sending
    }
  }

    const handleSendMessage = async () => {
      await SendMessages()
      scrollToBottom()
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || [])
      Promise.all(
        selectedFiles.map(
          f =>
            new Promise<{ name: string; content: string }>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () =>
                resolve({ name: f.name, content: reader.result as string })
              reader.onerror = reject
              reader.readAsText(f) // 🔑 read as plain text
            })
        )
      ).then(newFiles => {
        setFiles(prev => [...prev, ...newFiles])
      })
    }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
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
    <div className="h-screen flex bg-black relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(74,158,255,0.02)] to-transparent"></div>
      {/* Left Side - Chat History with Input (shown after first prompt) */}
      {showChatHistory && (
        <div className="w-[35%] bg-[#0f1419] flex flex-col relative z-10">
          {/* Chat Header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
            <h3 
              className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={handleGoHome}
            >
              <span className="text-white">Talk to </span>
              <span className="bg-gradient-to-r from-[#4a9eff] via-[#6b73ff] to-[#4a9eff] bg-clip-text text-transparent">
                Staicy
              </span>
            </h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 opacity-80 transition-opacity duration-300">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl border ${
                    message.type === 'user'
                      ? 'bg-[#252a3a] text-white border-[rgba(255,255,255,0.1)]'
                      : 'bg-[#1a1f2e] text-[#b8c2cc] border-[rgba(74,158,255,0.3)]'
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
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-cyan-100' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input at bottom of left panel */}
          <div className="p-6 border-t border-[rgba(255,255,255,0.1)]">
            <div className="relative flex items-end gap-2 rounded-xl bg-[#1a1f2e] border border-[rgba(255,255,255,0.1)] px-4 py-3 focus-within:ring-2 focus-within:ring-[#4a9eff] focus-within:border-[#4a9eff] transition-all duration-200">
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg transition-all duration-200 bg-[#4a9eff] hover:bg-[#3a8eef] text-white shadow-sm hover:shadow-md"
                title="Upload file"
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

              {/* Textarea */}
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                placeholder="Request modifications or ask questions..."
                className="flex-1 bg-transparent text-white placeholder-[#b8c2cc] resize-none focus:outline-none text-sm leading-tight max-h-36 overflow-y-auto py-2"
                disabled={isGenerating}
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!userPrompt.trim() || isGenerating}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  userPrompt.trim()
                    ? 'bg-[#4a9eff] hover:bg-[#3a8eef] text-white shadow-sm hover:shadow-md'
                    : 'bg-[#252a3a] text-[#b8c2cc] cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-[#b8c2cc] mt-3 text-center">
              Press Enter to send
            </div>
          </div>
        </div>
      )}

      {/* Center - Main Chat Area (only shown when no chat history) */}
      <div className={`flex-1 flex flex-col ${showChatHistory ? 'hidden' : 'w-full'}`}>
        {/* Enterprise Landing Page */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden w-full">
          {/* Cursor-style Minimalistic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-3">
              {/* Vertical Grid Lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-slate-700/20"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-slate-700/20"></div>
              
              {/* Horizontal Grid Lines */}
              <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-700/15"></div>
              <div className="absolute top-2/3 left-0 right-0 h-px bg-slate-700/15"></div>
            </div>
            
            {/* Dot Matrix Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-1/4 left-3/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-1/2 left-3/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-3/4 left-1/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-3/4 left-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
              <div className="absolute top-3/4 left-3/4 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
            </div>
            
            {/* Subtle Glow Effects */}
            <div className="absolute inset-0 opacity-8">
              <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-cyan-400/20 rounded-full blur-sm"></div>
              <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-blue-400/15 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={handleGoHome}
            >
              <span className="text-white">Talk to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift">
                Staicy
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl text-white/90 mb-16 font-light max-w-2xl mx-auto">
              Turn Words into Workflows
            </p>

{/* ChatGPT-style Input Bar */}
<div className="relative flex items-end gap-2 rounded-xl bg-slate-800/60 backdrop-blur-sm px-3 py-2 focus-within:ring-1 focus-within:ring-cyan-400">
  
  {/* Upload Button */}
  <button
    onClick={() => fileInputRef.current?.click()}
    className="p-2 rounded-md transition-colors bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
    title="Upload file"
  >
    <Upload className="h-4 w-4" />
  </button>
  <input
    ref={fileInputRef}
    type="file"
    multiple
    onChange={handleFileUpload}
    className="hidden"
  />

  {/* Textarea */}
  <textarea
    value={userPrompt}
    onChange={(e) => setUserPrompt(e.target.value)}
    onKeyDown={handleKeyPress}
    rows={1}
    placeholder="Create a database schema diagram for an e-commerce app with users, products, and orders"
    className="flex-1 bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none text-sm leading-tight max-h-36 overflow-y-auto py-2"
    disabled={isGenerating}
  />

  {/* Send Button */}
  <button
    onClick={handleSendMessage}
    disabled={!userPrompt.trim() || isGenerating}
    className={`p-2 rounded-md transition-colors ${
      userPrompt.trim()
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
    }`}
  >
    {isGenerating ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Send className="h-4 w-4" />
    )}
  </button>
</div>
          </div>
        </div>
      </div>

      {/* Right Side - Draw.io Panel (spans rest of screen) */}
      {showChatHistory && (
        <div className="flex-1 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] relative -ml-12 shadow-2xl border border-[rgba(74,158,255,0.1)]">
          {/* Subtle connecting line */}
          <div className="absolute left-0 top-1/2 w-px h-32 bg-gradient-to-b from-transparent via-[#4a9eff] to-transparent opacity-30"></div>
          
          {/* Focal point glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(74,158,255,0.03)] to-transparent pointer-events-none"></div>
          
          {/* Draw.io Viewer Embed - Full Screen */}
          <div className="w-full h-full relative">
            <iframe
              key={iframeKey}
              frameborder="0"
              style={{
                width: '100%', 
                height: '100%',
                opacity: 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
              src="https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&dark=1#G1Uuk_vzD4F4P4W_y_WdP6a3babjmZUUaf"
              title="Draw.io Viewer"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-top-navigation"
              onLoad={() => {
                setIsRefreshing(false)
                updateStatus('Diagram loaded')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
