import type { AccountRole } from '../src/types'

declare global {
  namespace Express {
    interface Request {
      authUser: {
        id: string
        email: string
        role: AccountRole
        display_name: string
        avatar: string | null
        city: string
        phone: string
        bio: string
        interests_json: string
        password_hash: string
      } | null
    }
  }
}

export {}
