"use client"

import { useState, useEffect } from "react"
import { useAppointments } from "@/lib/appointments-context"
import AppointmentCalendar from "@/components/AppointmentCalendar"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AppointmentsPage() {
  const { appointments = [], removeAppointment, updateAppointment, loading, error } = useAppointments()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()

  const openReschedule = (id: string) => {
    setRescheduleId(id)
    setCalendarOpen(true)
  }

  const closeCalendar = () => {
    setCalendarOpen(false)
    setRescheduleId(null)
  }

  const handleRescheduleSuccess = async (date: Date, time: string, staffName?: string) => {
    if (!rescheduleId) return
    const newDate = new Date(date)
    const [hours, minutes] = time.split(/[: ]/)
    newDate.setHours(parseInt(hours), parseInt(minutes))
    await updateAppointment(rescheduleId, newDate)
    closeCalendar()
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-[#012169] text-white">
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">My Appointments</h1>

        <div className="flex items-center justify-between mb-6">
          <div>
            {loading && <p className="text-white/80">Loading appointments...</p>}
            {error && <p className="text-red-400">{error}</p>}
          </div>
          <button
            onClick={() => setCalendarOpen(true)}
            className="px-6 py-3 bg-[#002366] text-white rounded-lg hover:bg-[#001a4d] transition-colors shadow-md"
          >
            Book New Appointment
          </button>
        </div>

        {appointments.length === 0 && !loading && (
          <div className="text-center p-8 bg-white/10 rounded-lg">
            <p className="text-white">No upcoming appointments found</p>
          </div>
        )}

        <ul className="space-y-4">
          {appointments.map((apt) => (
            <li
              key={apt.id}
              className={`border p-4 rounded-lg shadow-sm flex justify-between items-center
                ${apt.status === "cancelled"
                  ? "bg-red-100/20 border-red-300"
                  : "bg-white/10 border-white/10"}`}
            >
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">
                  {new Date(apt.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  <span className="ml-2 font-normal text-white/70">{apt.time}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <span className="bg-white/10 text-white px-2 py-1 rounded text-sm">
                    {apt.staffName} ({apt.staffRole})
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    apt.status === "booked"
                      ? "bg-green-200 text-green-800"
                      : apt.status === "rescheduled"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {apt.status !== "cancelled" && (
                  <>
                    <button
                      title="Reschedule"
                      onClick={() => openReschedule(apt.id!)}
                      className="text-white hover:text-white/80 p-2 hover:bg-white/10 rounded-full"
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      title="Cancel Appointment"
                      onClick={() => removeAppointment(apt.id!)}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-100/20 rounded-full"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {calendarOpen && (
          <AppointmentCalendar
            isOpen={calendarOpen}
            onClose={closeCalendar}
            initialStaffId={null}
            onSuccess={handleRescheduleSuccess}
          />
        )}
      </main>
    </div>
  )
}
