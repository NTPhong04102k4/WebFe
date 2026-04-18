import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "./index";

describe("storage service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("token", () => {
    it("getToken returns null when nothing stored", () => {
      expect(storage.getToken()).toBeNull();
    });

    it("getToken returns null for invalid values", () => {
      localStorage.setItem("auth_token", "undefined");
      expect(storage.getToken()).toBeNull();
      localStorage.setItem("auth_token", "null");
      expect(storage.getToken()).toBeNull();
    });

    it("setToken and getToken roundtrip", () => {
      storage.setToken("my-jwt-token");
      expect(storage.getToken()).toBe("my-jwt-token");
    });

    it("removeToken clears the token", () => {
      storage.setToken("token");
      storage.removeToken();
      expect(storage.getToken()).toBeNull();
    });
  });

  describe("user", () => {
    it("getUser returns null when nothing stored", () => {
      expect(storage.getUser()).toBeNull();
    });

    it("getUser returns null for invalid JSON", () => {
      localStorage.setItem("auth_user", "not-json{{{");
      expect(storage.getUser()).toBeNull();
    });

    it("setUser and getUser roundtrip", () => {
      const user = { id: 1, email: "a@b.com" };
      storage.setUser(user);
      expect(storage.getUser()).toMatchObject(user);
    });

    it("removeUser clears the user", () => {
      storage.setUser({ id: 1 });
      storage.removeUser();
      expect(storage.getUser()).toBeNull();
    });
  });

  describe("generic get/set/remove", () => {
    it("set and get roundtrip", () => {
      storage.set("test_key", "hello");
      expect(storage.get("test_key")).toBe("hello");
    });

    it("remove deletes key", () => {
      storage.set("k", "v");
      storage.remove("k");
      expect(storage.get("k")).toBeNull();
    });
  });
});
