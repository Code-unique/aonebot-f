"use client"

import {
  useUser,
  useClerk,
  UserButton,
  SignInButton,
} from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }

    if (isLoaded && user) {
      setFullName(user.fullName || "")
    }
  }, [isLoaded, isSignedIn, user, router])

  const handleUpdate = async () => {
    try {
      setStatus("Saving...")
      await user.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
      })
      setStatus("✅ Profile updated successfully!")
      setEditing(false)
    } catch (error) {
      console.error(error)
      setStatus("❌ Update failed.")
    }
  }

  if (!isLoaded) return <div className="p-4 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#012169] via-[#0a2472] to-[#001644] text-white">
      {/* Header */}
      <header className="w-full bg-[#012169] border-b border-white/20 py-5 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="text-3xl font-extrabold tracking-wider text-white drop-shadow-lg">
            A One Real Estate
          </a>
          <nav className="hidden md:flex items-center gap-8 text-white/90 font-semibold">
            <a
              href="/appointments"
              className="hover:text-white transition duration-300 ease-in-out"
            >
              Appointments
            </a>
            <a
              href="/profile"
              className="hover:text-white transition duration-300 ease-in-out underline underline-offset-4 decoration-2 decoration-white/70"
              aria-current="page"
            >
              Profile
            </a>
          </nav>
          <div className="flex items-center gap-5">
            {isSignedIn ? (
              <>
                <span className="hidden md:block text-sm font-medium drop-shadow-md">
                  Hello, <span className="font-bold">{user?.firstName || user?.username}</span>
                </span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-white/20 hover:bg-white/40 text-[#012169] font-semibold px-5 py-2 rounded-lg shadow-lg transition duration-300">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center py-20 px-6 max-w-4xl mx-auto space-y-16">

        {/* Profile Card */}
        <section className="w-full bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-lg p-10 max-w-xl border border-white/20">
          <h2 className="text-3xl font-bold mb-8 text-center tracking-wide drop-shadow-md">
            {editing ? "Edit Profile" : "Your Profile"}
          </h2>

          <div className="space-y-8 text-white">
            {/* Full Name */}
            <div>
              <label className="block mb-2 font-semibold text-lg">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  className="w-full rounded-lg px-4 py-3 text-gray-900 font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0f47a1]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="bg-white bg-opacity-20 rounded-lg p-3 text-lg font-medium tracking-wide">
                  {fullName || "N/A"}
                </p>
              )}
            </div>

            {/* Username (read-only) */}
            <div>
              <label className="block mb-2 font-semibold text-lg">Username</label>
              <p className="bg-white bg-opacity-20 rounded-lg p-3 text-lg font-medium tracking-wide text-gray-200 select-text">
                {user?.username || "N/A"}
              </p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block mb-2 font-semibold text-lg">Email</label>
              <p className="bg-white bg-opacity-20 rounded-lg p-3 text-lg font-medium tracking-wide text-gray-200 select-text">
                {user?.primaryEmailAddress?.emailAddress || "N/A"}
              </p>
            </div>

            {/* Phone (read-only) */}
            <div>
              <label className="block mb-2 font-semibold text-lg">Phone</label>
              <p className="bg-white bg-opacity-20 rounded-lg p-3 text-lg font-medium tracking-wide text-gray-200 select-text">
                {user?.primaryPhoneNumber?.phoneNumber || "Not Added"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setEditing(!editing)}
                className="bg-gradient-to-r from-[#0041a3] to-[#002366] hover:from-[#002366] hover:to-[#0041a3] px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
                aria-label="Toggle edit profile"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>

              {editing && (
                <button
                  onClick={handleUpdate}
                  className="bg-gradient-to-r from-[#228B22] to-[#006400] hover:from-[#006400] hover:to-[#228B22] px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
                  aria-label="Save profile changes"
                >
                  Save Changes
                </button>
              )}
            </div>

            {status && (
              <p className="text-center text-green-400 font-semibold mt-4 drop-shadow-md">
                {status}
              </p>
            )}

            {/* Sign Out */}
            <div className="flex justify-end pt-8">
              <button
                onClick={() => signOut(() => router.push("/"))}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
