import { apiFetch } from '../lib/api'
import type { CreateUserInput, UpdateUserInput, UpdateUserPermissionsInput, User } from './types'

export function listUsers() {
  return apiFetch<User[]>('/users')
}

export function createUser(input: CreateUserInput) {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser({ id, ...input }: UpdateUserInput) {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}

export function updateUserPermissions({ id, permissions }: UpdateUserPermissionsInput) {
  return apiFetch<void>(`/users/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  })
}
