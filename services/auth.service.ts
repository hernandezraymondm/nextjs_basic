import { config } from "@/config/app.config";

export const login = async (email: string, password: string) => {
  const response = await fetch(`${config.API_BASE_PATH}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

export const logout = async () => {
  await fetch(`${config.API_BASE_PATH}/auth/logout`, { method: "POST" });
};

export const refreshAccessToken = async () => {
  const response = await fetch(`${config.API_BASE_PATH}/refresh`, {
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${config.API_BASE_PATH}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
};

export const fetchUser = async (token: string) => {
  const response = await fetch(`${config.API_BASE_PATH}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Fetching user failed");
  }

  return response.json();
};
