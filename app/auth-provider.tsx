"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type AuthContextType = {
  user: { id: string; email: string; name?: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { accessToken } = await response.json();
      sessionStorage.setItem("accessToken", accessToken);
      await fetchUser(accessToken);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      sessionStorage.removeItem("accessToken");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      if (!response.ok) return null;
      const { accessToken } = await response.json();
      sessionStorage.setItem("accessToken", accessToken);
      return accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const { accessToken } = await response.json();
      sessionStorage.setItem("accessToken", accessToken);
      await fetchUser(accessToken);
      toast.success("Registered successfully");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      throw error;
    }
  };

  const handleApiError = useCallback(
    async (error: any) => {
      if (error.response && error.response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return newToken;
        } else {
          sessionStorage.removeItem("accessToken");
          setUser(null);
          router.push("/login");
        }
      }
      return null;
    },
    [router, refreshAccessToken]
  );

  const fetchUser = useCallback(
    async (token: string) => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          const newToken = await handleApiError({ response });
          if (newToken) {
            await fetchUser(newToken);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        await handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }

    const refreshTokenPeriodically = setInterval(async () => {
      const currentToken = sessionStorage.getItem("accessToken");
      if (currentToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          await fetchUser(newToken);
        }
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(refreshTokenPeriodically);
  }, [fetchUser, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, refreshAccessToken, register, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
