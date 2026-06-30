export type User = {
  id: string
  email: string
  name: string | null
  is_admin: boolean
  google_sub: string | null
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
