"use client"
import { FiHome } from "react-icons/fi"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import ChatAssistant from "@/components/ChatAssistant"
import { useRouter } from "next/navigation"

export default function Page() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#012169] border-b border-white/10 py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold tracking-wide text-white">
              A One Real Estate
            </h1>

            <nav className="hidden md:flex items-center gap-4">
              {/* Add navigation links here if needed */}
            </nav>
          </div>

          {/* Right Side (User Auth + Links) */}
          <div className="flex items-center gap-6">
            {isSignedIn ? (
              <>
                <span className="hidden md:block text-sm text-white">
                  Welcome, {user?.firstName || user?.username}
                </span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">
                  Sign In
                </button>
              </SignInButton>
            )}

            <a
              href="/profile"
              className="text-white/90 hover:text-white transition font-medium"
            >
              Profile
            </a>

            <a
              href="/appointments"
              className="text-white/90 hover:text-white transition font-medium"
            >
              Appointments
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Chat Assistant */}
      <main className="flex-1">
        <div className="w-full h-[calc(100vh-72px)] bg-white overflow-hidden flex flex-col">
          <ChatAssistant />
        </div>
      </main>
    </div>
  )
}