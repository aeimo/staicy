import { NavLink } from 'react-router-dom'
import { 
  FileText, 
  GitBranch
} from 'lucide-react'

export const Sidebar: React.FC = () => {

  const navigation = [
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Diagrams', href: '/diagrams', icon: GitBranch },
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

    </div>
  )
}
