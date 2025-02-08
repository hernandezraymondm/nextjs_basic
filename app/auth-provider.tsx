"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export type AuthContextType = {
  user: { id: string; email: string; name?: string } | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      await logout();
    }
  }, []); // Empty dependency array as it doesn't use any external values

  const refreshAccessToken = useCallback(async () => {
    const response = await fetch("/api/auth/refresh", { method: "POST" });
    if (!response.ok) {
      setAccessToken(null);
      setUser(null);
      router.push("/login");
      return null;
    }
    const { accessToken: newAccessToken } = await response.json();
    setAccessToken(newAccessToken);
    return newAccessToken;
  }, [router]);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { accessToken } = await response.json();
    setAccessToken(accessToken);
    await fetchUser(accessToken);
  };

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const { accessToken } = await response.json();
    setAccessToken(accessToken);
    await fetchUser(accessToken);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = await refreshAccessToken();
      if (token) {
        await fetchUser(token);
      }
    };

    initAuth();
  }, [refreshAccessToken, fetchUser]);

  useEffect(() => {
    if (!accessToken) return;

    const refreshInterval = setInterval(refreshAccessToken, 14 * 60 * 1000); // Refresh 1 minute before expiry (assuming 15-minute expiry)

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshAccessToken]);

  const contextValue = {
    user,
    accessToken,
    login,
    logout,
    refreshAccessToken,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
