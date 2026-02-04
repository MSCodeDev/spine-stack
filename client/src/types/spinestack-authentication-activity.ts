import type { Entity } from './spinestack-entity'
import type { EntityResponse } from './spinestack-response'

export type AuthenticationActivityEntity = Entity<AuthenticationActivityAttributes> & {
  type: 'AUTHENTICATION_ACTIVITY'
}

export interface AuthenticationActivityAttributes {
  email: string
  error: string | null
  ip: string
  source: string | null
  success: boolean
  timestamp: string
  userAgent: string
}

export type AuthenticationActivityIncludes = 'user'
export type AuthenticationActivitySort = 'timestamp' | 'email' | 'success' | 'ip' | 'error' | 'userId' | 'userAgent'

export type AuthenticationActivitySuccessResponse = EntityResponse<AuthenticationActivityEntity>
