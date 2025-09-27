import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { CollaborationUser, CollaborationState, DocumentChange, CursorPosition } from '../types'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface CollaborationContextType extends CollaborationState {
  connect: (documentId: string) => void
  disconnect: () => void
  sendDocumentChange: (change: DocumentChange) => void
  sendCursorPosition: (position: CursorPosition) => void
  joinDocument: (documentId: string) => void
  leaveDocument: (documentId: string) => void
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

type CollaborationAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ACTIVE_USERS'; payload: CollaborationUser[] }
  | { type: 'SET_CURRENT_USER'; payload: CollaborationUser | null }
  | { type: 'SET_DOCUMENT_ID'; payload: string | null }
  | { type: 'USER_JOINED'; payload: CollaborationUser }
  | { type: 'USER_LEFT'; payload: { userId: string } }
  | { type: 'DOCUMENT_CHANGED'; payload: DocumentChange }
  | { type: 'CURSOR_POSITION'; payload: { userId: string; position: number; selection?: any } }

const collaborationReducer = (state: CollaborationState, action: CollaborationAction): CollaborationState => {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_ACTIVE_USERS':
      return { ...state, activeUsers: action.payload }
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    case 'SET_DOCUMENT_ID':
      return { ...state, documentId: action.payload }
    case 'USER_JOINED':
      return {
        ...state,
        activeUsers: [...state.activeUsers.filter(u => u.id !== action.payload.id), action.payload]
      }
    case 'USER_LEFT':
      return {
        ...state,
        activeUsers: state.activeUsers.filter(u => u.id !== action.payload.userId)
      }
    case 'DOCUMENT_CHANGED':
      // Handle document changes
      return state
    case 'CURSOR_POSITION':
      return {
        ...state,
        activeUsers: state.activeUsers.map(user =>
          user.id === action.payload.userId
            ? { ...user, cursor: { position: action.payload.position, selection: action.payload.selection } }
            : user
        )
      }
    default:
      return state
  }
}

const initialState: CollaborationState = {
  activeUsers: [],
  currentUser: null,
  isConnected: false,
  documentId: null
}

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(collaborationReducer, initialState)
  const { user, token } = useAuth()
  const [socket, setSocket] = React.useState<Socket | null>(null)

  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email
        }
      })

      newSocket.on('connect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true })
        console.log('Connected to collaboration server')
      })

      newSocket.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false })
        console.log('Disconnected from collaboration server')
      })

      newSocket.on('collaborators', (users: CollaborationUser[]) => {
        dispatch({ type: 'SET_ACTIVE_USERS', payload: users })
      })

      newSocket.on('user-joined', (user: CollaborationUser) => {
        dispatch({ type: 'USER_JOINED', payload: user })
        toast.success(`${user.name} joined the document`)
      })

      newSocket.on('user-left', ({ userId }: { userId: string }) => {
        dispatch({ type: 'USER_LEFT', payload: { userId } })
      })

      newSocket.on('document-change', (change: DocumentChange) => {
        dispatch({ type: 'DOCUMENT_CHANGED', payload: change })
      })

      newSocket.on('cursor-position', (data: { userId: string; position: number; selection?: any }) => {
        dispatch({ type: 'CURSOR_POSITION', payload: data })
      })

      newSocket.on('error', (error: any) => {
        console.error('Collaboration error:', error)
        toast.error(error.message || 'Collaboration error')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user, token])

  const connect = (documentId: string) => {
    if (socket) {
      socket.emit('join-document', documentId)
      dispatch({ type: 'SET_DOCUMENT_ID', payload: documentId })
    }
  }

  const disconnect = () => {
    if (socket && state.documentId) {
      socket.emit('leave-document', state.documentId)
      dispatch({ type: 'SET_DOCUMENT_ID', payload: null })
    }
  }

  const sendDocumentChange = (change: DocumentChange) => {
    if (socket) {
      socket.emit('document-change', change)
    }
  }

  const sendCursorPosition = (position: CursorPosition) => {
    if (socket) {
      socket.emit('cursor-position', position)
    }
  }

  const joinDocument = (documentId: string) => {
    connect(documentId)
  }

  const leaveDocument = (documentId: string) => {
    disconnect()
  }

  const value: CollaborationContextType = {
    ...state,
    connect,
    disconnect,
    sendDocumentChange,
    sendCursorPosition,
    joinDocument,
    leaveDocument
  }

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>
}

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider')
  }
  return context
}
