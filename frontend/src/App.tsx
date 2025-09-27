import { AuthProvider } from './contexts/AuthContext'
import { CollaborationProvider } from './contexts/CollaborationContext'
import { Layout } from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <CollaborationProvider>
        <Layout />
      </CollaborationProvider>
    </AuthProvider>
  )
}

export default App
