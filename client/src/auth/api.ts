import { apiFetch } from '../lib/api'
import type { CurrentUser } from './types'

export function getCurrentUser() {
  return apiFetch<CurrentUser>('/auth/me')
}
