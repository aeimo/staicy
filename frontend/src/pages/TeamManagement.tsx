import { useState } from 'react'
import { Plus, Users, Settings, UserPlus, Mail } from 'lucide-react'

export const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members')

  const mockTeams = [
    {
      id: '1',
      name: 'Engineering',
      description: 'Core engineering team',
      members: 8,
      documents: 24,
      role: 'ADMIN'
    },
    {
      id: '2',
      name: 'Product',
      description: 'Product management team',
      members: 5,
      documents: 12,
      role: 'EDITOR'
    }
  ]

  const mockMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'EDITOR',
      status: 'active',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'CONTRIBUTOR',
      status: 'pending',
      lastActive: 'Never'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your teams and members.</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </button>
      </div>

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeams.map((team) => (
          <div key={team.id} className="card">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                </div>
                <span className={`badge ${
                  team.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'
                }`}>
                  {team.role}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="text-lg font-semibold text-gray-900">{team.members}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documents</p>
                  <p className="text-lg font-semibold text-gray-900">{team.documents}</p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="btn btn-sm btn-outline">
                  <Users className="mr-1 h-3 w-3" />
                  Members
                </button>
                <button className="btn btn-sm btn-outline">
                  <Settings className="mr-1 h-3 w-3" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Details */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Engineering Team</h3>
              <p className="card-description">Core engineering team members and settings</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('members')}
                className={`btn btn-sm ${activeTab === 'members' ? 'btn-primary' : 'btn-outline'}`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-content">
          {activeTab === 'members' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Team Members</h4>
                <button className="btn btn-primary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </button>
              </div>
              
              <div className="space-y-3">
                {mockMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`badge ${
                          member.status === 'active' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {member.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Last active: {member.lastActive}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="EDITOR">Editor</option>
                          <option value="CONTRIBUTOR">Contributor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Team Settings</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Allow Guest Access</p>
                      <p className="text-sm text-gray-500">Let external users view documents</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Require Approval</p>
                      <p className="text-sm text-gray-500">Documents need approval before publishing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Assistance</p>
                      <p className="text-sm text-gray-500">Enable AI suggestions and improvements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Diagram Generation</p>
                      <p className="text-sm text-gray-500">Allow AI to generate diagrams</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
