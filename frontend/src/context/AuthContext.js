import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

const initialToken = localStorage.getItem("token") || "";
if (initialToken) {
  setAuthToken(initialToken);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      setIsLoggingOut(false);
      return guestToken;
    } catch {
      // Si falla, el cliente puede intentar de nuevo más tarde.
      return "";
    }
  }

  useEffect(() => {
    if (!token && !isLoggingOut) {
      createGuestSession();
    }
  }, [token, isLoggingOut]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    setIsLoggingOut(false);
    setToken(res.data.token.access_token);
    setUser(res.data.user);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    setIsLoggingOut(false);
    setToken(res.data.token.access_token);
    setUser(res.data.user);
  }

  function logout() {
    setIsLoggingOut(true);
    setToken("");
    setUser(null);
    setAuthToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  const value = useMemo(
    () => ({ token, user, login, register, logout, updateUser, createGuestSession }),
    [token, user, isLoggingOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

