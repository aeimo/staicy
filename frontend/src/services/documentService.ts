import { apiClient } from './api'
import { Document, CreateDocumentRequest, UpdateDocumentRequest, APIResponse, AISuggestion } from '../types'

export const documentService = {
  async getDocuments(params?: {
    teamId?: string
    type?: Document['type']
    status?: Document['status']
    search?: string
    page?: number
    limit?: number
  }): Promise<APIResponse<Document[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.teamId) queryParams.append('teamId', params.teamId)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/documents?${queryString}` : '/api/documents'
    
    return apiClient.get<APIResponse<Document[]>>(endpoint)
  },

  async getDocument(id: string): Promise<{ document: Document }> {
    return apiClient.get<{ document: Document }>(`/api/documents/${id}`)
  },

  async createDocument(data: CreateDocumentRequest): Promise<{ document: Document; message: string }> {
    return apiClient.post<{ document: Document; message: string }>('/api/documents', data)
  },

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<{ document: Document; message: string }> {
    return apiClient.put<{ document: Document; message: string }>(`/api/documents/${id}`, data)
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/documents/${id}`)
  },

  async getAISuggestions(id: string): Promise<{ suggestions: AISuggestion[] }> {
    return apiClient.post<{ suggestions: AISuggestion[] }>(`/api/documents/${id}/ai/suggestions`)
  },

  async generateFromCode(codeContent: string, type: Document['type'], teamId: string, context?: string): Promise<{ document: Document; message: string }> {
    return apiClient.post<{ document: Document; message: string }>('/api/documents/generate-from-code', {
      codeContent,
      type,
      teamId,
      context
    })
  },

  async improveWithAI(id: string, improvements: string[]): Promise<{ document: Document; message: string }> {
    return apiClient.post<{ document: Document; message: string }>(`/api/documents/${id}/ai/improve`, {
      improvements
    })
  },

  async getCollaborators(id: string): Promise<{ collaborators: any[] }> {
    return apiClient.get<{ collaborators: any[] }>(`/api/documents/${id}/collaborators`)
  },

  async shareDocument(id: string, email: string, role?: 'VIEWER' | 'CONTRIBUTOR' | 'EDITOR'): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/documents/${id}/share`, {
      email,
      role
    })
  },

  async getVersions(id: string): Promise<{ versions: any[] }> {
    return apiClient.get<{ versions: any[] }>(`/api/documents/${id}/versions`)
  },

  async restoreVersion(id: string, versionId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/documents/${id}/versions/${versionId}/restore`)
  }
}
