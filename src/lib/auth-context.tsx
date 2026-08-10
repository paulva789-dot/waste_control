"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, AuthUser } from "./api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string; area?: string; town: string }) => Promise<void>;
  logout: () => void;
  updateSession: (token: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("dwms_token");
    const storedUser = localStorage.getItem("dwms_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(token: string, user: AuthUser) {
    localStorage.setItem("dwms_token", token);
    localStorage.setItem("dwms_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    persist(res.data.token, res.data.user);
    routeByRole(res.data.user.role);
  }

  async function register(data: { name: string; email: string; password: string; role: string; area?: string; town: string }) {
    const res = await api.post("/auth/register", data);
    persist(res.data.token, res.data.user);
    routeByRole(res.data.user.role);
  }

  function routeByRole(role: string) {
    const adminRoles = ["COUNCIL_ADMIN", "SYSTEM_ADMIN", "HYSACAM_SUPERVISOR", "INSPECTOR"];
    router.push(adminRoles.includes(role) ? "/admin" : "/dashboard");
  }

  function logout() {
    localStorage.removeItem("dwms_token");
    localStorage.removeItem("dwms_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateSession: persist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
