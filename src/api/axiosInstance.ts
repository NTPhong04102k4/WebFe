import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://web-7012.onrender.com',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? 'https://web-7012.onrender.com'}/auth/refresh-token`,
          { refreshToken }
        )
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
