import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'
import { Document } from '../types'
import { documentService } from '../services/documentService'

export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await documentService.getDocuments()
        setDocuments(response.data || [])
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize your documentation.</p>
        </div>
        <Link to="/documents/new" className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </button>
        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Documents */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-content">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.type} • {doc.team.name}
                    </p>
                  </div>
                  <span className={`badge ${
                    doc.status === 'APPROVED' ? 'badge-success' :
                    doc.status === 'REVIEW' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>v{doc.version}</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {doc.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-secondary text-xs">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{doc.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new document.'}
          </p>
          <div className="mt-6">
            <Link to="/documents/new" className="btn btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Document
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
