import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setAuthToken(token || "");
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  async function createGuestSession() {
    try {
      const res = await api.post("/auth/guest");
      const guestToken = res.data.token.access_token;
      setAuthToken(guestToken);
      setToken(guestToken);
      setUser(res.data.user);
      return guestToken;
    } catch {
      // Si falla, el cliente puede intentar de nuevo más tarde.
      return "";
    }
  }

  useEffect(() => {
    if (!token) {
      createGuestSession();
    }
  }, [token]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.token.access_token);
    setUser(res.data.user);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    setToken(res.data.token.access_token);
    setUser(res.data.user);
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  const value = useMemo(
    () => ({ token, user, login, register, logout, updateUser, createGuestSession }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

