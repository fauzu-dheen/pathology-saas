export type AuthResponse = {
  needs_onboarding: boolean
  access_token: string | null
  pending_token: string | null
}

export type CurrentUser = {
  user_id: string
  org_id: string
  email: string
  name: string | null
  is_admin: boolean
}
