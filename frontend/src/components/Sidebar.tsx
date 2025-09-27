import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  GitBranch, 
  Users, 
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Diagrams', href: '/diagrams', icon: GitBranch },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Integrations', href: '/integrations', icon: Settings },
  ]

  return (
    <div className="sidebar">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold gradient-text">Staicy</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Demo Mode - No authentication required
        </div>
      </div>
    </div>
  )
}
