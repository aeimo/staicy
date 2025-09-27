import { useState } from 'react'
import { Plus, Download, Share, Settings, Play, Square } from 'lucide-react'

export const DiagramStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [diagramType, setDiagramType] = useState<'FLOWCHART' | 'SEQUENCE' | 'CLASS' | 'ER' | 'ARCHITECTURE' | 'NETWORK'>('FLOWCHART')
  const [generatedDiagram, setGeneratedDiagram] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const diagramTypes = [
    { value: 'FLOWCHART', label: 'Flowchart', description: 'Process flow diagrams' },
    { value: 'SEQUENCE', label: 'Sequence', description: 'Interaction diagrams' },
    { value: 'CLASS', label: 'Class', description: 'Object relationships' },
    { value: 'ER', label: 'Entity Relationship', description: 'Database schemas' },
    { value: 'ARCHITECTURE', label: 'Architecture', description: 'System architecture' },
    { value: 'NETWORK', label: 'Network', description: 'Network topology' },
  ]

  const handleGenerateDiagram = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      // This would call the AI service to generate the diagram
      const mockDiagram = `graph TD
    A[${prompt}] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`
      
      setGeneratedDiagram(mockDiagram)
    } catch (error) {
      console.error('Error generating diagram:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagram Studio</h1>
          <p className="text-gray-600">Create and edit diagrams with AI assistance.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button className="btn btn-outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </button>
          <button className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Diagram
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Diagram Type Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Diagram Type</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-2 gap-3">
                {diagramTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDiagramType(type.value as any)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      diagramType === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Describe Your Diagram</h3>
            </div>
            <div className="card-content">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create: 'User login flow with MFA verification...'"
                className="textarea min-h-[120px]"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {prompt.length}/500 characters
                </div>
                <button
                  onClick={handleGenerateDiagram}
                  disabled={!prompt.trim() || isGenerating}
                  className="btn btn-primary"
                >
                  {isGenerating ? (
                    <>
                      <Square className="mr-2 h-4 w-4 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Suggestions</h3>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Add error handling to the flow
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Include user feedback loops
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Add decision points for edge cases
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Preview</h3>
              <div className="flex items-center space-x-2">
                <button className="btn btn-sm btn-outline">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="btn btn-sm btn-outline">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="card-content">
            {generatedDiagram ? (
              <div className="h-full min-h-[400px] bg-gray-50 rounded-lg p-4">
                <div className="bg-white rounded border p-4 h-full overflow-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {generatedDiagram}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No diagram generated</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Describe your diagram and click Generate to see the preview.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
