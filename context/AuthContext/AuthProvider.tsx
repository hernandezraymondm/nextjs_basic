"use client";

import { useState, useEffect, useCallback, createContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  login as loginService,
  logout as logoutService,
  refreshAccessToken as refreshAccessTokenService,
  register as registerService,
  fetchUser as fetchUserService,
} from "@/services/auth.service";
import { CustomError } from "@/lib/types/error.types";
import { AuthContextType, User } from "@/lib/types/auth.types";
import { config } from "@/config/auth.config";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const { accessToken } = await loginService(email, password);
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
      await logoutService();
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
      const { accessToken } = await refreshAccessTokenService();
      if (accessToken) {
        sessionStorage.setItem("accessToken", accessToken);
        return accessToken;
      }
      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      const { accessToken } = await registerService(name, email, password);
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
        const userData = await fetchUserService(token);
        setUser(userData);
      } catch (error: unknown) {
        const err = error as CustomError;
        if (
          err.message === "Fetching user failed" &&
          err.response &&
          err.response.status === 401
        ) {
          const newToken = await handleApiError({ response: err.response });
          if (newToken) {
            await fetchUser(newToken);
          }
        }
        console.error("Error fetching user:", error);
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
    }, config.TOKEN_REFRESH_INTERVAL);

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
