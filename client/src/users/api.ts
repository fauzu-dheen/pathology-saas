import { apiFetch } from '../lib/api'
import type { CreateUserInput, UpdateUserInput, User } from './types'

export function listUsers() {
  return apiFetch<User[]>('/users')
}

export function createUser(input: CreateUserInput) {
  return apiFetch<void>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser({ id, ...input }: UpdateUserInput) {
  return apiFetch<void>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}
