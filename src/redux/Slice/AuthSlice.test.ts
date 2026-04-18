import { describe, it, expect, beforeEach } from "vitest";
import authReducer, {
  setCredentials,
  clearCredentials,
  selectIsAuthenticated,
  selectUser,
  selectToken,
} from "./AuthSlice";
import type { RootState } from "../store";

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const mockUser = {
  userID: 1,
  userUUID: "abc-123",
  userCode: "U001",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  dateOfBirth: null,
  gender: "M",
  identityNumber: "",
  phone: "0900000000",
  email: "test@example.com",
  address: "",
  username: "testuser",
  passwordHash: "",
  passwordSalt: "",
  emailVerified: true,
  phoneVerified: false,
  idSocial: "",
  lastLoginDate: new Date(),
  loginAttempts: 0,
  isLocked: false,
  lockUntil: null,
  isActive: true as const,
  createdDate: new Date(),
  updatedDate: new Date(),
  image: "",
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initialState when no stored credentials", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setCredentials stores token and user", () => {
    const state = authReducer(
      initialState,
      setCredentials({ token: "tok123", user: mockUser })
    );
    expect(state.token).toBe("tok123");
    expect(state.user).toMatchObject({ userUUID: "abc-123" });
    expect(state.isAuthenticated).toBe(true);
  });

  it("setCredentials with null user sets isAuthenticated via token", () => {
    const state = authReducer(
      initialState,
      setCredentials({ token: "tok123", user: null })
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toBeNull();
  });

  it("clearCredentials resets state", () => {
    const withAuth = authReducer(
      initialState,
      setCredentials({ token: "tok123", user: mockUser })
    );
    const cleared = authReducer(withAuth, clearCredentials());
    expect(cleared.token).toBeNull();
    expect(cleared.user).toBeNull();
    expect(cleared.isAuthenticated).toBe(false);
  });

  it("selectors return correct slices", () => {
    const state = { auth: authReducer(initialState, setCredentials({ token: "t", user: mockUser })) } as RootState;
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectToken(state)).toBe("t");
    expect(selectUser(state)).toMatchObject({ email: "test@example.com" });
  });
});
