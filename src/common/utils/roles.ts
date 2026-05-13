import { getRolesFromToken } from '@/services/decode'
import type { AuthUser } from '@/stores/authStore'

/** Role names the backend may emit (JWT). */
export const ROLE = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
} as const

const STAFF_BACKEND = new Set(
  [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.STAFF].map((r) => r.toLowerCase())
)

export function normalizeRoles(roles: string[]): string[] {
  return roles.map((r) => r.trim().toLowerCase())
}

export function getUserRoles(user: Pick<AuthUser, 'role'> | null | undefined): string[] {
  const role = user?.role
  if (!role) return []
  return [role]
}

/** Admin / SuperAdmin / Staff — GUI vận hành xưởng & bảo hiểm. */
export function canAccessStaffBackend(roles: string[]): boolean {
  const n = normalizeRoles(roles)
  return n.some((r) => STAFF_BACKEND.has(r))
}

export function isCustomerOnly(roles: string[]): boolean {
  const n = normalizeRoles(roles)
  return n.length === 0 || n.every((r) => r === ROLE.CUSTOMER.toLowerCase())
}

export function getDefaultRouteForRoles(roles: string[]): string {
  return canAccessStaffBackend(roles) ? '/admin/dashboard' : '/'
}

/** Customer-only (hoặc không có role staff) — dùng để ẩn link Staff. */
export function hasStaffBackendAccessFromToken(token: string | null): boolean {
  return canAccessStaffBackend(getRolesFromToken(token))
}

