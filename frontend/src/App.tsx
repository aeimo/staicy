import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CollaborationProvider } from './contexts/CollaborationContext'
import { Layout } from './components/Layout'
import { DocumentList } from './pages/DocumentList'
import { DocumentEditor } from './pages/DocumentEditor'
import { DiagramStudio } from './pages/DiagramStudio'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <CollaborationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DocumentList />} />
            <Route path="documents" element={<DocumentList />} />
            <Route path="documents/:id" element={<DocumentEditor />} />
            <Route path="diagrams" element={<DiagramStudio />} />
          </Route>
        </Routes>
      </CollaborationProvider>
    </AuthProvider>
  )
}

export default App
