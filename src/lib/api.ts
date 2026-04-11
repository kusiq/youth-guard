import type {
  AppealDraft,
  AppealStatus,
  AppSnapshot,
  NewsDraft,
  RegisterPayload,
  SignInPayload,
  UserProfile,
} from '../types'

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (response.ok === false) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  getAppState() {
    return request<AppSnapshot>('/api/app/state')
  },
  signIn(payload: SignInPayload) {
    return request<AppSnapshot>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  register(payload: RegisterPayload) {
    return request<AppSnapshot>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  signOut() {
    return request<AppSnapshot>('/api/auth/logout', {
      method: 'POST',
    })
  },
  publishNews(draft: NewsDraft) {
    return request<AppSnapshot>('/api/admin/news', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
  },
  toggleNewsLike(newsId: string) {
    return request<AppSnapshot>(`/api/news/${newsId}/like`, {
      method: 'POST',
    })
  },
  addComment(newsId: string, text: string) {
    return request<AppSnapshot>(`/api/news/${newsId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },
  createAppeal(draft: AppealDraft) {
    return request<AppSnapshot>('/api/appeals', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
  },
  updateProfile(draft: UserProfile) {
    return request<AppSnapshot>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(draft),
    })
  },
  markAppealsSeen() {
    return request<AppSnapshot>('/api/admin/appeals/mark-seen', {
      method: 'POST',
    })
  },
  updateAppealStatus(appealId: string, nextStatus: AppealStatus) {
    return request<AppSnapshot>(`/api/admin/appeals/${appealId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    })
  },
}
