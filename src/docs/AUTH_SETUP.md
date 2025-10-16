# Hướng dẫn thiết lập đăng nhập OAuth

## Tổng quan
Hệ thống đăng nhập đã được tích hợp với Facebook và Google OAuth 2.0 mà không sử dụng thư viện ngoài. Tất cả logic OAuth được xử lý thông qua các API trực tiếp.

## Cấu trúc hệ thống

### 1. AuthService (`src/services/authService.ts`)
- Quản lý toàn bộ logic đăng nhập
- Xử lý OAuth flow cho Google và Facebook
- Lưu trữ thông tin user trong localStorage
- Singleton pattern để đảm bảo consistency

### 2. AuthContext (`src/contexts/AuthContext.tsx`)
- React Context để quản lý authentication state toàn cục
- Cung cấp hooks cho các component con
- Tự động xử lý OAuth callback
- Hỗ trợ đăng nhập bằng Google, Facebook và Email

### 3. Login Page (`src/pages/login/index.tsx`)
- Giao diện đăng nhập/đăng ký
- Tích hợp với AuthContext
- Hỗ trợ đăng nhập bằng email/password và OAuth

### 4. Auth Callback (`src/pages/auth/callback.tsx`)
- Xử lý response từ OAuth providers
- Tự động redirect sau khi đăng nhập thành công

## Thiết lập OAuth

### Google OAuth Setup

1. **Tạo Google Cloud Project:**
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo project mới hoặc chọn project hiện có

2. **Kích hoạt Google+ API:**
   - Vào APIs & Services > Library
   - Tìm và kích hoạt "Google+ API"

3. **Tạo OAuth 2.0 Credentials:**
   - Vào APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Chọn "Web application"
   - Thêm Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

4. **Lấy Client ID:**
   - Copy Client ID từ credentials
   - Thêm vào file `.env`:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

### Facebook OAuth Setup

1. **Tạo Facebook App:**
   - Truy cập [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App"
   - Chọn "Consumer" hoặc "Business"
   - Điền thông tin app

2. **Thêm Facebook Login:**
   - Vào App Dashboard
   - Click "Add Product" > "Facebook Login"
   - Chọn "Web"

3. **Cấu hình Facebook Login:**
   - Vào Facebook Login > Settings
   - Thêm Valid OAuth Redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

4. **Lấy App ID:**
   - Copy App ID từ App Dashboard
   - Thêm vào file `.env`:
   ```
   REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id-here
   ```

## Sử dụng trong ứng dụng

### 1. Sử dụng AuthContext

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    loginWithGoogle, 
    loginWithFacebook, 
    logout 
  } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Xin chào, {user?.name}!</p>
        <button onClick={logout}>Đăng xuất</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={loginWithGoogle}>Đăng nhập Google</button>
      <button onClick={loginWithFacebook}>Đăng nhập Facebook</button>
    </div>
  );
}
```

### 2. Kiểm tra authentication state

```tsx
import { useAuth } from '../contexts/AuthContext';

function ProtectedComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập để tiếp tục</div>;
  }

  return <div>Nội dung được bảo vệ</div>;
}
```

### 3. Đăng nhập bằng email/password

```tsx
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      // Đăng nhập thành công
    } catch (error) {
      // Xử lý lỗi
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

## Lưu ý quan trọng

### 1. Backend Integration
- Hiện tại hệ thống sử dụng mock data cho demo
- Trong production, cần tích hợp với backend để:
  - Xác thực authorization code
  - Lưu trữ thông tin user
  - Quản lý session/token

### 2. Security
- Luôn validate dữ liệu từ OAuth providers
- Sử dụng HTTPS trong production
- Implement proper session management
- Validate redirect URIs

### 3. Error Handling
- Xử lý các trường hợp lỗi OAuth
- Hiển thị thông báo lỗi thân thiện
- Fallback cho các trường hợp network issues

### 4. Testing
- Test với các tài khoản khác nhau
- Test các trường hợp lỗi
- Test trên các browser khác nhau

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid redirect URI"**
   - Kiểm tra redirect URI trong OAuth app settings
   - Đảm bảo URI khớp chính xác (bao gồm protocol và port)

2. **"App not found"**
   - Kiểm tra App ID/Client ID
   - Đảm bảo app đã được publish (Facebook)

3. **"Access denied"**
   - User từ chối cấp quyền
   - Kiểm tra scope permissions

4. **CORS errors**
   - Đảm bảo domain được thêm vào authorized origins
   - Kiểm tra HTTPS/HTTP configuration

## Mở rộng

### Thêm OAuth providers khác:
1. Tạo config trong `src/config/oauth.ts`
2. Thêm method trong `AuthService`
3. Cập nhật UI trong login page
4. Thêm route callback nếu cần

### Tích hợp với backend:
1. Tạo API endpoints để xử lý OAuth
2. Implement JWT token management
3. Thêm refresh token logic
4. Implement proper session management
