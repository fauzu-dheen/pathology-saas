export const ALL_PERMISSIONS = [
  'reports:create',
  'reports:view',
  'reports:edit',
  'reports:delete',
  'slides:upload',
  'slides:view',
  'slides:update',
  'slides:delete',
  'slides:share',
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]

export type User = {
  id: string
  email: string
  name: string | null
  is_admin: boolean
  google_sub: string | null
  permissions: Permission[]
}

export type CreateUserInput = {
  email: string
  name?: string | null
}

export type UpdateUserInput = {
  id: string
  name?: string | null
  is_admin?: boolean | null
}

export type UpdateUserPermissionsInput = {
  id: string
  permissions: Permission[]
}
