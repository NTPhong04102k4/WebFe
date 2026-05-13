import React, { useState } from "react";
import { GoArrowRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as yup from "yup";
import { authAPI } from "src/services/api/functions/auth/authFn";
import { getRolesFromToken, getTokenClaims } from "src/services/decode";
import { useAuthStore } from "@/stores/authStore";
import { canAccessStaffBackend } from "@/common/utils/roles";

const Admin = React.memo(() => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const adminLoginSchema = yup.object().shape({
    username: yup
      .string()
      .required("Vui lòng nhập tài khoản")
      .min(3, "Tài khoản phải có ít nhất 3 ký tự"),
    password: yup
      .string()
      .required("Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  });

  async function handleLogin() {
    setFieldErrors({});
    setError(null);
    try {
      await adminLoginSchema.validate(
        { username, password },
        { abortEarly: false }
      );
    } catch (err: any) {
      const fe: { username?: string; password?: string } = {};
      err.inner?.forEach((e: any) => {
        if (e.path && !fe[e.path as "username" | "password"]) {
          fe[e.path as "username" | "password"] = e.message;
        }
      });
      setFieldErrors(fe);
      setError("Vui lòng kiểm tra lại các trường đã nhập");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.adminLogin({ username, password });
      const token = res.data.token;
      const claims = getTokenClaims(token);
      const roles = getRolesFromToken(token);

      setTokens(token, "");
      setUser({
        id: Number(claims?.sub ?? 0) || 0,
        userID: Number(claims?.sub ?? 0) || 0,
        userUUID: typeof claims?.sub === "string" ? claims.sub : undefined,
        username,
        email: String(claims?.email ?? ""),
        fullName: res.data.fullName,
        role: roles[0] ?? "Admin",
      });

      if (!canAccessStaffBackend(roles)) {
        useAuthStore.getState().logout();
        setError("Tài khoản này không có quyền vào khu quản trị");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <Header>
          <Title>Admin Login</Title>
          <Subtitle>
            Hello there, Sign in and start managing your website
          </Subtitle>
        </Header>

        <FieldRow>
          <Label>Admin:</Label>
          <FieldCol>
            <Input
              type="text"
              placeholder="Admin_User"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!fieldErrors.username}
            />
            {fieldErrors.username && (
              <ErrorText>{fieldErrors.username}</ErrorText>
            )}
          </FieldCol>
        </FieldRow>
        <FieldRow>
          <Label>Password:</Label>
          <FieldCol>
            <Input
              type="password"
              placeholder="@123456..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <ErrorText>{fieldErrors.password}</ErrorText>
            )}
          </FieldCol>
        </FieldRow>
        {error && <FormError>{error}</FormError>}

        <Actions>
          <LoginButton
            onClick={handleLogin}
            aria-label="Login"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Login"}
            <GoArrowRight size={24} />
          </LoginButton>
        </Actions>
      </Card>
    </Page>
  );
});

export default Admin;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  background: #e0f2fe; /* sky-50 */
  width: 100%;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  width: 35%;
  min-width: 320px;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 0;
  width: 100%;
  background: #a78bfa; /* purple-400 */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  color: #2563eb; /* blue-600 */
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
    Cantarell, Noto Sans, sans-serif, "Helvetica Neue", Arial,
    "Apple Color Emoji", "Segoe UI Emoji";
  font-weight: 700;
  font-size: 28px;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.h3`
  color: #111827;
  font-weight: 400;
  font-size: 16px;
  margin: 0;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 32px;
  position: relative;
  padding: 16px 24px;
`;

const Label = styled.h2`
  color: #4b5563;
  width: 15%;
  min-width: 90px;
  font-weight: 500;
  font-size: 16px;
  margin: 0;
`;

const FieldCol = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Input = styled.input`
  padding: 10px 10px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #f3f4f6;
  color: #374151;
  font-size: 14px;
  background: #ffffff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #9ca3af;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  &[aria-invalid="true"] {
    border-color: #ef4444;
  }
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
`;

const FormError = styled.div`
  color: #dc2626;
  font-size: 14px;
  padding: 0 24px;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 0 24px 0;
`;

const LoginButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d1d5db;
  color: #111827;
  font-size: 18px;
  border-radius: 24px;
  padding: 8px 24px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

  &:active {
    transform: scale(0.98);
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
