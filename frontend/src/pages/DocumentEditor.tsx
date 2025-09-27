import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Share, MoreVertical, Users, MessageSquare } from 'lucide-react'
import { Document } from '../types'
import { documentService } from '../services/documentService'
import { useCollaboration } from '../contexts/CollaborationContext'

export const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [content, setContent] = useState('')
  
  const { activeUsers, joinDocument, leaveDocument } = useCollaboration()

  useEffect(() => {
    if (id) {
      joinDocument(id)
    }

    return () => {
      if (id) {
        leaveDocument(id)
      }
    }
  }, [id, joinDocument, leaveDocument])

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return

      try {
        const response = await documentService.getDocument(id)
        setDocument(response.document)
        setContent(JSON.stringify(response.document.content, null, 2))
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  const handleSave = async () => {
    if (!id) return

    setIsSaving(true)
    try {
      const updatedDocument = await documentService.updateDocument(id, {
        content: JSON.parse(content)
      })
      setDocument(updatedDocument.document)
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Document not found</h2>
          <p className="text-gray-600 mt-2">The document you're looking for doesn't exist.</p>
          <Link to="/documents" className="btn btn-primary mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/documents" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
              <p className="text-sm text-gray-500">
                {document.type} • {document.team.name} • v{document.version}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Active collaborators */}
            {activeUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 border-2 border-white"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button className="btn btn-outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments
            </button>
            
            <button className="btn btn-outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            
            <button className="btn btn-ghost">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start writing your document..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
          <div className="space-y-6">
            {/* Document info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Document Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`badge ${
                    document.status === 'APPROVED' ? 'badge-success' :
                    document.status === 'REVIEW' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {document.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Version:</span>
                  <span className="text-gray-900">v{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Author:</span>
                  <span className="text-gray-900">{document.author.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-900">{new Date(document.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {document.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <span key={tag} className="badge badge-secondary text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {document.aiSuggestions && document.aiSuggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">AI Suggestions</h3>
                <div className="space-y-2">
                  {document.aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">{suggestion.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-blue-600">
                          {suggestion.type} • {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
