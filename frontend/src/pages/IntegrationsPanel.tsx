import { useState } from 'react'
import { Plus, Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export const IntegrationsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'connected'>('available')

  const availableIntegrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Sync repositories and generate documentation from code',
      icon: '🐙',
      status: 'available',
      features: ['Code sync', 'PR documentation', 'Repository analysis']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and manage documents from Slack',
      icon: '💬',
      status: 'available',
      features: ['Notifications', 'Slash commands', 'Team updates']
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Sync with Confluence spaces and pages',
      icon: '📚',
      status: 'available',
      features: ['Space sync', 'Page export', 'Content migration']
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Generate requirements from Jira tickets',
      icon: '🎫',
      status: 'available',
      features: ['Ticket sync', 'Requirements generation', 'Project tracking']
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Export documents to Notion databases',
      icon: '📝',
      status: 'available',
      features: ['Database sync', 'Page export', 'Content sharing']
    }
  ]

  const connectedIntegrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connected to 3 repositories',
      icon: '🐙',
      status: 'connected',
      lastSync: '2 hours ago',
      config: { repositories: 3, webhooks: 2 }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connected to #engineering channel',
      icon: '💬',
      status: 'connected',
      lastSync: '1 hour ago',
      config: { channels: 1, commands: 3 }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect external tools to enhance your documentation workflow.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'available'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'connected'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connected
            </button>
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableIntegrations.map((integration) => (
            <div key={integration.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  <span className="badge badge-secondary">Available</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {integration.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button className="btn btn-primary w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connected Integrations */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          {connectedIntegrations.length > 0 ? (
            connectedIntegrations.map((integration) => (
              <div key={integration.id} className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                        <div className="flex items-center mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Connected</span>
                          <span className="text-sm text-gray-500 ml-2">• Last sync: {integration.lastSync}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button className="btn btn-outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </button>
                      <button className="btn btn-outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </button>
                      <button className="btn btn-ghost text-red-600 hover:text-red-700">
                        Disconnect
                      </button>
                    </div>
                  </div>
                  
                  {/* Integration Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-sm font-medium text-green-600">Active</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Sync</p>
                        <p className="text-sm font-medium text-gray-900">{integration.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Health</p>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-green-600">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connected integrations</h3>
              <p className="text-gray-500 mb-6">
                Connect your first integration to get started with automated workflows.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn btn-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Browse Integrations
              </button>
            </div>
          )}
        </div>
      )}

      {/* Integration Setup Modal Placeholder */}
      <div className="hidden">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Integration</h3>
            <p className="text-sm text-gray-500 mb-6">
              Configure your integration settings to start syncing data.
            </p>
            <div className="flex justify-end space-x-3">
              <button className="btn btn-outline">Cancel</button>
              <button className="btn btn-primary">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
