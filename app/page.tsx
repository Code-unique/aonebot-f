"use client"
import { FiHome } from "react-icons/fi"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import ChatAssistant from "@/components/ChatAssistant"

export default function Page() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 p-4 bg-gradient-to-r from-[#012169] to-[#1a3a7e] shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="text-white text-2xl" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">A One Real Estate</h1>
          </div>

          {/* Authentication */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <div className="text-white hidden md:block">
                  <span className="text-sm opacity-75">Welcome,</span>{" "}
                  <span className="font-medium">{user.firstName || user.username}</span>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
                  Sign In
                </button>
              </SignInButton>
            )}
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
