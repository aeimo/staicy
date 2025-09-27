import { Search, Bell, Plus } from 'lucide-react'
import { useCollaboration } from '../contexts/CollaborationContext'

export const Header: React.FC = () => {
  const { activeUsers, isConnected } = useCollaboration()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, diagrams..."
              className="input pl-10 w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Collaboration status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Active users */}
          {activeUsers.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Active:</span>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 border-2 border-white"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
          </button>

          {/* Create button */}
          <button className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </button>
        </div>
      </div>
    </header>
  )
}
