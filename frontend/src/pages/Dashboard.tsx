import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  GitBranch, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Plus,
  Search
} from 'lucide-react'
import { documentService } from '../services/documentService'
import { Document } from '../types'

export const Dashboard: React.FC = () => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const response = await documentService.getDocuments({ limit: 5 })
        setRecentDocuments(response.data || [])
      } catch (error) {
        console.error('Error fetching recent documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDocuments()
  }, [])

  const stats = [
    { name: 'Total Documents', value: '24', icon: FileText, change: '+12%', changeType: 'positive' },
    { name: 'Active Diagrams', value: '8', icon: GitBranch, change: '+3', changeType: 'positive' },
    { name: 'Team Members', value: '12', icon: Users, change: '+2', changeType: 'positive' },
    { name: 'AI Suggestions', value: '15', icon: TrendingUp, change: '+5', changeType: 'positive' },
  ]

  const quickActions = [
    { name: 'New Document', href: '/documents', icon: FileText, color: 'bg-blue-500' },
    { name: 'Create Diagram', href: '/diagrams', icon: GitBranch, color: 'bg-green-500' },
    { name: 'Invite Team', href: '/teams', icon: Users, color: 'bg-purple-500' },
    { name: 'Setup Integration', href: '/integrations', icon: TrendingUp, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your documentation.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="input pl-10 w-64"
            />
          </div>
          <Link to="/documents" className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Recent Documents</h3>
                <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentDocuments.length > 0 ? (
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {doc.team.name} • {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          doc.status === 'APPROVED' ? 'badge-success' :
                          doc.status === 'REVIEW' ? 'badge-warning' :
                          'badge-secondary'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
                  <div className="mt-6">
                    <Link to="/documents" className="btn btn-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Document
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Insights</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">5 documents need review</p>
                    <p className="text-xs text-gray-500">AI suggests improvements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">3 diagrams outdated</p>
                    <p className="text-xs text-gray-500">Consider updating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
