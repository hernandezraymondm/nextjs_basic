import { config } from "@/config/app.config";

export const updateUser = async (name: string, token: string) => {
  const response = await fetch(`${config.API_BASE_PATH}/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
};

export const deleteUser = async (token: string) => {
  const response = await fetch(`${config.API_BASE_PATH}/user`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user account");
  }

  return response.json();
};
