export type AuthResponse = {
  needs_onboarding: boolean
  access_token: string | null
  pending_token: string | null
}
