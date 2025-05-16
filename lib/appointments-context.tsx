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
        // First, get the user record from Supabase
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single()

        if (userError || !userData) {
          console.log("User not found in database, skipping appointment fetch")
          setLoading(false)
          return
        }

        // Then fetch appointments for this user
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
          .order("date", { ascending: true })

        if (appointmentsError) {
          throw appointmentsError
        }

        if (data) {
          // Transform the data to match our expected format
          const formattedAppointments = data.map((apt) => ({
            id: apt.id,
            staff_id: apt.staff_id,
            date: new Date(apt.date),
            status: apt.status,
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

  const addAppointment = async (appointment: AppointmentWithStaff) => {
    setLoading(true)
    setError(null)

    try {
      if (!isSignedIn || !user) {
        throw new Error("User not authenticated")
      }

      // First, ensure the user exists in our database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single()

      let userId = userData?.id

      // If user doesn't exist, create them
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

      // Now create the appointment
      const { data, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: userId,
          staff_id: appointment.staff_id,
          date: appointment.date,
          notes: appointment.notes || `Appointment with ${appointment.staffName}`,
        })
        .select("id, date, status, staff_id")
        .single()

      if (appointmentError || !data) {
        throw appointmentError || new Error("Failed to create appointment")
      }

      // Add the new appointment to state
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

  const removeAppointment = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id)

      if (error) {
        throw error
      }

      setAppointments((prev) => prev.filter((apt) => apt.id !== id))
    } catch (err) {
      console.error("Error removing appointment:", err)
      setError("Failed to cancel appointment")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, removeAppointment, loading, error }}>
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
