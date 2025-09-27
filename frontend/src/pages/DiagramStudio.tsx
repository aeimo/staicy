import { useState, useRef, useEffect } from 'react'
import { 
  Settings,
  Square,
  Circle,
  ArrowRight,
  Github,
  Send,
  Image,
  FileText,
  Loader2
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isGenerating?: boolean
}

export const DiagramStudio: React.FC = () => {
  const [aiModel, setAiModel] = useState('Claude 3.7 Sonnet')
  const [userPrompt, setUserPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI diagram assistant. I can help you create, modify, and analyze diagrams. What would you like to create today?',
      timestamp: new Date()
    }
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [diagramXML, setDiagramXML] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const drawioRef = useRef<HTMLIFrameElement>(null)

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/diagrams/image-to-diagram', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setDiagramXML(data.xml)
        
        const message: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I've analyzed your image and created a diagram with ${data.elements} elements. The diagram has been loaded into the editor.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Error processing image:', error)
    }
  }

  const handleRefineDiagram = async () => {
    if (!userPrompt.trim()) return

    try {
      const response = await fetch('/api/diagrams/refine-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingXML: diagramXML,
          refinementPrompt: userPrompt
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDiagramXML(data.xml)
        
        const message: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I've refined your diagram based on your request. The updated diagram has been loaded.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, message])
        setUserPrompt('')
      }
    } catch (error) {
      console.error('Error refining diagram:', error)
    }
  }


  return (
    <div className="h-screen flex flex-col bg-gray-50">

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Simplified */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
          <div className="space-y-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <FileText className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Square className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Circle className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Canvas Area - Draw.io Integration */}
        <div className="flex-1 bg-gray-100 relative">
          <iframe
            ref={drawioRef}
            src="https://app.diagrams.net/?embed=1&ui=kennedy&spin=1&modified=unsavedChanges&proto=json&noSaveBtn=1&saveAndExit=0&lang=en"
            className="w-full h-full border-0"
            title="Draw.io Editor"
            allow="clipboard-read; clipboard-write"
            onLoad={() => {
              // Send diagram XML to Draw.io when it loads
              if (diagramXML && drawioRef.current) {
                const iframe = drawioRef.current
                iframe.contentWindow?.postMessage({
                  action: 'load',
                  xml: diagramXML
                }, '*')
              }
            }}
          />
        </div>

        {/* Right Sidebar - Chat Only */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* GenAI-DrawIO-Creator Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">GenAI-DrawIO-Creator</h3>
              <div className="flex items-center space-x-2 mb-4">
                <select 
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option>Claude 3.7 Sonnet</option>
                  <option>GPT-4</option>
                  <option>Claude 3.5 Haiku</option>
                </select>
                <Github className="h-4 w-4 text-gray-500" />
              </div>
            </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
                            <span className="text-sm">Generating diagram...</span>
                          </div>
                        ) : (
                          <div className="text-sm">{message.content}</div>
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

                {/* User Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe your diagram or ask for changes..."
                      className="flex-1 p-3 border border-gray-300 rounded-md text-sm"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!userPrompt.trim() || isGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                      <Image className="h-4 w-4" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {diagramXML && (
                      <button
                        onClick={handleRefineDiagram}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Refine Diagram</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Press Cmd/Ctrl + Enter to send • Upload images to replicate diagrams
                  </div>
                </div>

          </div>
        </div>
      </div>
    </div>
  )
}