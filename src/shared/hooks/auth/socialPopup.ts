import { ENV } from 'src/config/environment'
import { AUTH_ROUTES } from 'src/services/api/functions/auth/auth.routes'
import { logger } from '@/common/utils/logger'
import type { SocialAuthProvider, SocialAuthResult, SocialTokens } from './socialPopup.types'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getApiBaseUrl() {
  return (ENV.API_URL || '').replace(/\/$/, '')
}

function getApiOrigin(baseApiUrl: string) {
  try {
    return new URL(baseApiUrl).origin
  } catch {
    return ''
  }
}

function getAuthPath(provider: SocialAuthProvider) {
  return provider === 'google'
    ? AUTH_ROUTES.GOOGLE_LOGIN
    : AUTH_ROUTES.FACEBOOK_LOGIN
}

function isProviderMessage(provider: SocialAuthProvider, type: string) {
  const prefix = provider === 'google' ? 'GOOGLE' : 'FACEBOOK'
  return type === `${prefix}_LOGIN_SUCCESS` || type === `${prefix}_LOGIN_ERROR`
}

function isSuccessMessage(type: string) {
  return (
    type === 'GOOGLE_LOGIN_SUCCESS' ||
    type === 'FACEBOOK_LOGIN_SUCCESS' ||
    type === 'OAUTH_SUCCESS'
  )
}

function isErrorMessage(type: string) {
  return (
    type === 'GOOGLE_LOGIN_ERROR' ||
    type === 'FACEBOOK_LOGIN_ERROR' ||
    type === 'OAUTH_ERROR'
  )
}

function readMessage(data: unknown): (Record<string, unknown> & { type: string }) | null {
  if (!isRecord(data) || typeof data.type !== 'string') return null
  return data as Record<string, unknown> & { type: string }
}

function readString(data: Record<string, unknown>, key: string) {
  const value = data[key]
  return typeof value === 'string' ? value : undefined
}

function readTokens(data: Record<string, unknown>) {
  const tokens = data.tokens
  return isRecord(tokens) ? tokens as Partial<SocialTokens> : undefined
}

export function openSocialAuthPopup(provider: SocialAuthProvider): Promise<SocialAuthResult> {
  return new Promise((resolve, reject) => {
    const baseApiUrl = getApiBaseUrl()
    const apiOrigin = getApiOrigin(baseApiUrl)

    if (!baseApiUrl || !apiOrigin) {
      reject(new Error('Thieu cau hinh VITE_API_BASE_URL cho social login'))
      return
    }

    const popup = window.open(
      `${baseApiUrl}${getAuthPath(provider)}`,
      `${provider}_oauth`,
      'width=500,height=700,scrollbars=yes,resizable=yes,popup=yes'
    )

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'))
      return
    }

    let resolved = false

    const cleanup = () => {
      window.removeEventListener('message', messageListener)
      clearInterval(checkInterval)
      clearTimeout(timeout)
      try {
        if (!popup.closed) popup.close()
      } catch (error) {
        logger.error('Error closing OAuth popup:', error)
      }
    }

    const finish = (result: SocialAuthResult) => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(result)
    }

    const fail = (error: string) => {
      if (resolved) return
      resolved = true
      cleanup()
      reject(new Error(error))
    }

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== apiOrigin) {
        logger.warn('Rejected OAuth message from origin:', event.origin)
        return
      }

      const data = readMessage(event.data)
      if (!data?.type) return
      if (!isProviderMessage(provider, data.type) && data.type !== 'OAUTH_SUCCESS' && data.type !== 'OAUTH_ERROR') return

      if (isErrorMessage(data.type)) {
        fail(readString(data, 'error') || readString(data, 'message') || `${provider} login failed`)
        return
      }

      if (isSuccessMessage(data.type)) {
        const tokens = readTokens(data)
        const token = readString(data, 'token') || readString(data, 'access_token') || tokens?.access_token
        if (!token) {
          fail('No token received from backend')
          return
        }

        finish({
          provider,
          user: data.user ?? {},
          refreshToken: readString(data, 'refresh_token') || readString(data, 'refreshToken'),
          tokens: {
            access_token: token,
            token_type: tokens?.token_type || 'Bearer',
          },
        })
      }
    }

    const checkInterval = window.setInterval(() => {
      try {
        if (popup.closed && !resolved) fail('Popup was closed by user')
      } catch {
        // Cross-origin popup access can throw while provider auth is in progress.
      }
    }, 500)

    const timeout = window.setTimeout(() => {
      if (!resolved) fail('Login timeout')
    }, 300000)

    window.addEventListener('message', messageListener)
  })
}
