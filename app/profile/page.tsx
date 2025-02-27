"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserInfo } from "@/components/user-info";
import { deleteUser, updateUser } from "@/services/user.service";

export default function Profile() {
  const { user, logout, loading, fetchUser } = useAuth();
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("ProtectedRoute: No access token, redirecting...");
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return;
    await updateUser(name, accessToken)
      .then(() => {
        toast.success("Profile updated successfully");
      })
      .catch(() => {
        toast.error("Failed to update profile. Please try again.");
      })
      .finally(() => {
        fetchUser(accessToken);
      });
  };

  const handleDelete = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return;
    await deleteUser(accessToken)
      .then(() => {
        toast.success("User account deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete account. Please try again.");
      })
      .finally(() => {
        logout();
        router.push("/login");
      });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          User Profile
        </h2>
        <UserInfo user={user} label="Information" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Profile
            </button>
          </div>
        </form>
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Logout
          </button>
        </div>
        <div className="text-center">
          <Link
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
