import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Our App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demonstrating hybrid authentication with Next.js
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Login
            </Link>
          </div>
          <div className="rounded-md shadow mt-3">
            <Link
              href="/register"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Register
            </Link>
          </div>
          <div className="rounded-md shadow">
            <Link
              href="/profile"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
