"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabaseBrowserClient, type Appointment } from "./supabase"
import { useUser } from "@clerk/nextjs"

interface AppointmentWithStaff extends Appointment {
  staffName: string
  staffRole: string
  time: string
}

interface AppointmentsContextType {
  appointments: AppointmentWithStaff[]
  addAppointment: (appointment: AppointmentWithStaff) => Promise<void>
  removeAppointment: (id: string) => Promise<void>
  updateAppointment: (id: string, newDate: Date) => Promise<void>
  loading: boolean
  error: string | null
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<AppointmentWithStaff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isSignedIn } = useUser()
  const supabase = getSupabaseBrowserClient()

  // Load appointments from Supabase when user is signed in
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isSignedIn || !user) return

      setLoading(true)
      setError(null)

      try {
        // Get user record from Supabase
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single()

        if (userError || !userData) {
          setLoading(false)
          return
        }

        // Fetch appointments for this user, exclude cancelled by default
        const { data, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            id,
            date,
            status,
            notes,
            staff_id,
            staff:staff_id (name, role)
          `)
          .eq("user_id", userData.id)
          .neq("status", "cancelled")
          .order("date", { ascending: true })

        if (appointmentsError) {
          throw appointmentsError
        }

        if (data) {
          const formattedAppointments = data.map((apt) => ({
            id: apt.id,
            staff_id: apt.staff_id,
            date: new Date(apt.date),
            status: apt.status || "booked",
            notes: apt.notes,
            staffName: apt.staff?.name || "Unknown",
            staffRole: apt.staff?.role || "Staff Member",
            time: new Date(apt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))

          setAppointments(formattedAppointments)
        }
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [isSignedIn, user, supabase])

  // Add a new appointment (booking)
  const addAppointment = async (appointment: AppointmentWithStaff) => {
    setLoading(true)
    setError(null)

    try {
      if (!isSignedIn || !user) {
        throw new Error("User not authenticated")
      }

      // Ensure user exists in Supabase users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single()

      let userId = userData?.id

      if (userError || !userData) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            clerk_id: user.id,
            name: user.fullName || user.firstName || user.username || "Unknown",
            email: user.primaryEmailAddress?.emailAddress || "",
          })
          .select("id")
          .single()

        if (createError || !newUser) {
          throw new Error("Failed to create user record")
        }

        userId = newUser.id
      }

      // Create the appointment
      const { data, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: userId,
          staff_id: appointment.staff_id,
          date: appointment.date,
          status: "booked",
          notes: appointment.notes || `Appointment with ${appointment.staffName}`,
        })
        .select("id, date, status, staff_id")
        .single()

      if (appointmentError || !data) {
        throw appointmentError || new Error("Failed to create appointment")
      }

      const newAppointment: AppointmentWithStaff = {
        ...data,
        date: new Date(data.date),
        staffName: appointment.staffName,
        staffRole: appointment.staffRole,
        time: new Date(data.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setAppointments((prev) => [...prev, newAppointment])
    } catch (err) {
      console.error("Error adding appointment:", err)
      setError("Failed to save appointment")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Soft cancel appointment (update status)
  const removeAppointment = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: new Date() })
        .eq("id", id)

      if (error) {
        throw error
      }

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
      )
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError("Failed to cancel appointment")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Reschedule appointment (update date and status)
  const updateAppointment = async (id: string, newDate: Date) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ date: newDate, status: "rescheduled", updated_at: new Date() })
        .eq("id", id)

      if (error) {
        throw error
      }

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? {
                ...apt,
                date: newDate,
                status: "rescheduled",
                time: newDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }
            : apt
        )
      )
    } catch (err) {
      console.error("Error rescheduling appointment:", err)
      setError("Failed to reschedule appointment")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppointmentsContext.Provider
      value={{ appointments, addAppointment, removeAppointment, updateAppointment, loading, error }}
    >
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentsProvider")
  }
  return context
}
