// User & Auth Types
export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface GoogleLoginRequest {
  credential: string
}

// Member Types
export interface Member {
  id: string
  name: string
  phone: string
  memo?: string
  photo_path?: string
  created_at: string
  updated_at: string
}

export interface CreateMemberRequest {
  name: string
  phone: string
  memo?: string
  photo_path?: string
}

export interface UpdateMemberRequest {
  name?: string
  phone?: string
  memo?: string
  photo_path?: string
}

// Style Types
export interface Style {
  id: string
  image_url?: string // deprecated in favor of image_path but kept for compatibility
  image_path?: string
  name?: string
  exists?: boolean
  tags?: string[]
  gender?: string
  category?: string
}

export interface StyleUpdate {
  name?: string
  tags?: string[]
  gender?: string
  category?: string
}

// Synthesis Types
export interface SynthesisRequest {
  user_image: File
  style_id: string
}

export interface SynthesisResult {
  result_image: string // base64
  style_id: string
}

export interface SynthesisHistory {
  id: string
  member_id?: string
  original_photo_path: string
  reference_style_id: string
  result_photo_path?: string
  is_synced: boolean
  created_at: string
}

// API Response Types
export interface ApiError {
  detail: string
}
