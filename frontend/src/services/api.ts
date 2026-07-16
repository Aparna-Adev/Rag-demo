const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

let accessToken = ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UploadResponse {
  message: string
  document_id: number
  filename: string
  chunk_count: number
}

export interface DocumentRecord {
  id: number
  filename: string
  created_at: string
  chunk_count: number
}

export interface ListDocumentsResponse {
  documents: DocumentRecord[]
}

export interface ChatSource {
  filename: string
  score: number
}

export interface ChatResponse {
  answer: string
  sources: ChatSource[]
}

export interface DeleteDocumentResponse {
  message: string
  document_id: number
  file_deleted: boolean
  file_note: string
}

export function setAccessToken(token: string) {
  accessToken = token
}

function authHeaders(): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

async function readError(response: Response, fallback: string) {
  try {
    const body = await response.json() as { detail?: unknown }
    return typeof body.detail === 'string' ? body.detail : fallback
  } catch {
    return fallback
  }
}

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    throw new ApiError(await readError(response, 'Request failed.'), response.status)
  }

  return response.json() as Promise<T>
}

export async function register(email: string, password: string) {
  await requestJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string) {
  const formData = new URLSearchParams({ username: email, password })

  return requestJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  })
}

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return requestJson<UploadResponse>('/documents/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
}

export async function listDocuments() {
  return requestJson<ListDocumentsResponse>('/documents', {
    method: 'GET',
    headers: authHeaders(),
  })
}

export async function deleteDocument(documentId: string) {
  return requestJson<DeleteDocumentResponse>(`/documents/${documentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export async function sendChatMessage(question: string) {
  return requestJson<ChatResponse>('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ question }),
  })
}
