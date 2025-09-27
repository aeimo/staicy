import { useState, useRef, useEffect } from 'react'
import { 
  Send,
  Upload,
  Image,
  FileText,
  Loader2,
  X,
  Download,
  Eye
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isGenerating?: boolean
}

export const DiagramStudio: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI diagram assistant. You can describe what you want to create in natural language, or upload your codebase and I\'ll generate documentation and diagrams for you.',
      timestamp: new Date()
    }
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [diagramXML, setDiagramXML] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
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

    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      // Call the AI service to generate diagram
      const response = await fetch('/api/diagrams/generate-drawio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          type: 'ARCHITECTURE',
          context: 'AI Diagram Generation'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDiagramXML(data.xml)
        setShowPreview(true)
        
        // Update the thinking message with actual response
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                ...msg,
                content: `I've generated a diagram based on your request: "${userPrompt}". The diagram has been created with ${data.elements} elements and a confidence score of ${data.confidence}%.`,
                isGenerating: false
              }
            : msg
        ))
      } else {
        throw new Error('Failed to generate diagram')
      }
    } catch (error) {
      console.error('Error generating diagram:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? {
              ...msg,
              content: 'Sorry, I encountered an error while generating your diagram. Please try again.',
              isGenerating: false
            }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadedFiles(prev => [...prev, ...files])
    
    // Process files for codebase analysis
    const fileContents = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        content: await file.text(),
        type: file.type
      }))
    )

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)

    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      // Analyze codebase and generate documentation/diagrams
      const response = await fetch('/api/documents/analyze-codebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContents: fileContents,
          type: 'ARCHITECTURE'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Set the diagram XML from the response
        if (data.diagram && data.diagram.xml) {
          setDiagramXML(data.diagram.xml)
          setShowPreview(true)
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                ...msg,
                content: `I've analyzed your codebase and generated documentation and diagrams. Found ${data.fileCount} files and created an architecture diagram showing the system structure.`,
                isGenerating: false
              }
            : msg
        ))
      } else {
        throw new Error('Failed to analyze codebase')
      }
    } catch (error) {
      console.error('Error analyzing codebase:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? {
              ...msg,
              content: 'Sorry, I encountered an error while analyzing your codebase. Please try again.',
              isGenerating: false
            }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Staicy</h1>
          <div className="text-sm text-gray-500">
            AI-Powered Documentation & Diagram Generation
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showPreview ? 'mr-96' : ''}`}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing and generating...</span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end space-x-3">
              {/* File Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Upload codebase files"
              >
                <Upload className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.fs,.vb,.sql,.html,.css,.scss,.less,.xml,.json,.yaml,.yml,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe what you want to create or upload your codebase..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!userPrompt.trim() || isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Press Cmd/Ctrl + Enter to send • Upload code files for automatic analysis
            </div>
          </div>
        </div>

        {/* Sliding Preview Panel */}
        <div className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 z-50 ${
          showPreview ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Diagram Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {/* Download functionality */}}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Download diagram"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Draw.io Editor */}
            <div className="flex-1">
              <iframe
                ref={drawioRef}
                src="https://app.diagrams.net/?embed=1&ui=kennedy&spin=1&modified=unsavedChanges&proto=json&noSaveBtn=1&saveAndExit=0&lang=en"
                className="w-full h-full border-0"
                title="Draw.io Editor"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when preview is open */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={closePreview}
        />
      )}
    </div>
  )
}