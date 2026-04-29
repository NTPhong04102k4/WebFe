import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/services/types/auth.types'

interface JwtPayload {
  sub?: string
  email?: string
  unique_name?: string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string
  role?: string
  nameid?: string
  name?: string
  exp?: number
  iat?: number
}

export type DecodedUser = AuthUser

export function decodeToken(token: string): DecodedUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      payload.role ??
      'Customer'
    const nameId =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
      payload.sub ??
      '0'
    return {
      id: parseInt(nameId, 10) || 0,
      userID: parseInt(nameId, 10) || 0,
      username: payload.unique_name ?? payload.name ?? '',
      email: payload.email ?? '',
      fullName: payload.name ?? payload.unique_name ?? '',
      role,
    }
  } catch {
    return null
  }
}

