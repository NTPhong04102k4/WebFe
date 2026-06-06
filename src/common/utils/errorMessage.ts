import { AxiosError } from 'axios'

export function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (err.response?.status === 401) return 'Phiên đăng nhập hết hạn'
    if (err.response?.status === 403) return 'Không có quyền thực hiện'
    if (err.response?.status === 404) return 'Không tìm thấy dữ liệu'
    if (err.response?.status === 409) return data?.message ?? 'Dữ liệu đã tồn tại'
    if (err.response?.status === 422) return data?.message ?? 'Dữ liệu không hợp lệ'
    if (err.response?.status === 500) return 'Lỗi máy chủ, vui lòng thử lại sau'
  }
  if (err instanceof Error && err.message) return err.message
  return 'Đã xảy ra lỗi, vui lòng thử lại'
}

