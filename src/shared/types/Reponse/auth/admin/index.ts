export interface AdminLoginResponse {
  /** JWT access token */
  token: string;
  fullName: string;
  /** Optional refresh token (nếu backend cấu hình trả về) */
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}
