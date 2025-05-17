"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiUser,
  FiMapPin,
  FiStar,
  FiBell,
} from "react-icons/fi"
import { useAppointments } from "@/lib/appointments-context"
import { getSupabaseBrowserClient, type Staff } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"

interface AppointmentCalendarProps {
  isOpen: boolean
  onClose: () => void
  initialStaffId?: number | null
  onSuccess?: (date: Date, time: string, staffName: string) => void
}

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

export default function AppointmentCalendar({
  isOpen,
  onClose,
  initialStaffId = null,
  onSuccess,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(initialStaffId)
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [step, setStep] = useState(1) // 1: Date, 2: Time, 3: Staff, 4: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [stepTransition, setStepTransition] = useState(false)

  const { addAppointment } = useAppointments()
  const { isSignedIn, user } = useUser()

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentDate(new Date())
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedStaffId(initialStaffId)
      setStep(initialStaffId ? 1 : selectedStaffId ? 2 : 1)
      setIsSubmitting(false)
      setIsSuccess(false)
      setError(null)
      setNeedsSignIn(false)
      setStepTransition(false)
    }
  }, [isOpen, initialStaffId, selectedStaffId])

  // Fetch staff members from Supabase
  useEffect(() => {
    const fetchStaff = async () => {
      if (!isOpen) return

      setLoading(true)
      setError(null)

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("staff").select("*").order("name")
        if (error) {
          throw error
        }

        if (data) {
          setStaffMembers(data)
        }
      } catch (err) {
        console.error("Error fetching staff:", err)
        setError("Failed to load staff members")
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [isOpen])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: null, isToday: false, isPast: true })
    }

    // Add days of the month
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      const isPast = date < new Date(today.setHours(0, 0, 0, 0))

      days.push({ day: i, date, isToday, isPast })
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateSelect = (date: Date | null) => {
    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(date)
      setStepTransition(true)
      setTimeout(() => {
        setStep(2)
        setStepTransition(false)
      }, 300)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStepTransition(true)
    setTimeout(() => {
      if (!initialStaffId) {
        setStep(3)
      } else {
        setStep(4)
      }
      setStepTransition(false)
    }, 300)
  }

  const handleStaffSelect = (staffId: number) => {
    setSelectedStaffId(staffId)
    setStepTransition(true)
    setTimeout(() => {
      setStep(4)
      setStepTransition(false)
    }, 300)
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedStaffId) return

    if (!isSignedIn) {
      setNeedsSignIn(true)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const staffMember = staffMembers.find((staff) => staff.id === selectedStaffId)
      if (!staffMember) {
        throw new Error("Selected staff member not found")
      }

      const appointmentDate = new Date(selectedDate)
      const [hours, minutes, period] = selectedTime.match(/(\d+):(\d+)\s(AM|PM)/)?.slice(1) || []
      let hour = Number.parseInt(hours)
      if (period === "PM" && hour !== 12) hour += 12
      if (period === "AM" && hour === 12) hour = 0
      appointmentDate.setHours(hour, Number.parseInt(minutes), 0, 0)

      await addAppointment({
        staff_id: selectedStaffId,
        date: appointmentDate,
        staffName: staffMember.name,
        staffRole: staffMember.role,
        time: selectedTime,
        notes: `Appointment with ${staffMember.name} (${staffMember.role})`,
      })

      setIsSuccess(true)

      if (onSuccess) {
        onSuccess(appointmentDate, selectedTime, staffMember.name)
      }

      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      setError("Failed to book appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStepTransition(true)
    setTimeout(() => {
      if (step === 2) setStep(1)
      else if (step === 3) setStep(2)
      else if (step === 4) setStep(initialStaffId ? 2 : 3)
      setStepTransition(false)
    }, 300)
  }

  const calendarDays = generateCalendarDays()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Book an Appointment</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <FiX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiLoader className="w-8 h-8 animate-spin text-[#012169] mb-4" />
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <FiAlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>{error}</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-[#012169] text-white rounded-lg hover:bg-[#001a4d] transition-colors" 
                    onClick={() => setError(null)}
                  >
                    Try Again
                  </button>
                </div>
              ) : needsSignIn ? (
                <div className="text-center py-8">
                  <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Sign In Required</h3>
                  <p className="text-gray-600 mb-4">
                    You need to sign in to book an appointment. This helps us keep track of your bookings.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#012169] text-white rounded-lg hover:bg-[#001a4d] transition-colors"
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Appointment Confirmed!</h3>
                  <p className="text-gray-600 mb-4">
                    Your appointment has been scheduled for{" "}
                    {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at{" "}
                    {selectedTime}.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <FiBell className="text-blue-500" />
                    <span>We'll send you a reminder 24 hours before your appointment</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUser className="text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {staffMembers.find((staff) => staff.id === selectedStaffId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiMapPin className="text-blue-500" />
                      <span className="text-gray-700">A One Real Estate, Adelaide Office</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiStar className="text-yellow-500" />
                      <span className="text-gray-700">Rated {staffMembers.find((staff) => staff.id === selectedStaffId)?.rating || 4.8}/5</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress Steps */}
                  <div className="flex justify-between mb-6">
                    <div className={`step ${step >= 1 ? "active" : ""}`}>
                      <div className="step-number">1</div>
                      <div className="step-label">Date</div>
                    </div>
                    <div className={`step ${step >= 2 ? "active" : ""}`}>
                      <div className="step-number">2</div>
                      <div className="step-label">Time</div>
                    </div>
                    {!initialStaffId && (
                      <div className={`step ${step >= 3 ? "active" : ""}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Specialist</div>
                      </div>
                    )}
                    <div className={`step ${step >= 4 ? "active" : ""}`}>
                      <div className="step-number">{initialStaffId ? 3 : 4}</div>
                      <div className="step-label">Confirm</div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1: Date Selection */}
                    {step === 1 && !stepTransition && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={handlePrevMonth}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FiChevronLeft size={24} className="text-gray-600" />
                          </button>
                          <h3 className="text-lg font-medium text-gray-900">
                            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </h3>
                          <button
                            onClick={handleNextMonth}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FiChevronRight size={24} className="text-gray-600" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500">
                              {day}
                            </div>
                          ))}

                          {calendarDays.map((day, index) => (
                            <button
                              key={index}
                              disabled={day.isPast || day.day === 0}
                              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm
                                ${day.day === 0 ? "invisible" : ""}
                                ${day.isToday ? "border-2 border-[#012169] font-bold" : ""}
                                ${day.isPast ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"}
                                ${
                                  selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString()
                                    ? "bg-[#012169] text-white"
                                    : ""
                                }`}
                              onClick={() => handleDateSelect(day.date)}
                            >
                              {day.day}
                            </button>
                          ))}
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-4">
                          Please select a date for your appointment.
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Time Selection */}
                    {step === 2 && !stepTransition && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Time</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {selectedDate?.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map((time) => (
                              <motion.button
                                key={time}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 border rounded-lg text-center transition-colors
                                  ${selectedTime === time 
                                    ? "bg-[#012169] text-white border-[#012169]" 
                                    : "hover:border-[#012169] text-gray-700 border-gray-300"}`}
                                onClick={() => handleTimeSelect(time)}
                              >
                                {time}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            Back
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Staff Selection */}
                    {step === 3 && !stepTransition && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Specialist</h3>

                        <div className="space-y-2 mb-4">
                          {staffMembers.map((staff) => (
                            <motion.button
                              key={staff.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full p-3 border rounded-lg text-left transition-colors flex items-center
                                ${selectedStaffId === staff.id 
                                  ? "border-[#012169] bg-blue-50" 
                                  : "hover:border-[#012169] border-gray-300"}`}
                              onClick={() => handleStaffSelect(staff.id)}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center
                                  ${selectedStaffId === staff.id ? "border-[#012169]" : "border-gray-400"}`}
                              >
                                {selectedStaffId === staff.id && (
                                  <div className="w-2 h-2 rounded-full bg-[#012169]"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{staff.name}</div>
                                <div className="text-sm text-gray-600">{staff.role}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            Back
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && !stepTransition && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Your Appointment</h3>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex items-start mb-3">
                            <FiCalendar className="text-gray-500 mt-1 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">Date & Time</div>
                              <div className="text-gray-600">
                                {selectedDate?.toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                })}{" "}
                                at {selectedTime}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <FiClock className="text-gray-500 mt-1 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">Specialist</div>
                              <div className="text-gray-600">
                                {staffMembers.find((staff) => staff.id === selectedStaffId)?.name ||
                                  "Any available staff"}
                                {" - "}
                                {staffMembers.find((staff) => staff.id === selectedStaffId)?.role}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800 flex items-center gap-2">
                          <FiBell className="flex-shrink-0" />
                          <p>You'll receive a confirmation email and SMS reminder before your appointment.</p>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            Back
                          </button>
                          <motion.button
                            onClick={handleConfirm}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 bg-[#012169] text-white rounded-lg hover:bg-[#001a4d] transition-colors ${
                              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <FiLoader className="animate-spin" /> Booking...
                              </span>
                            ) : (
                              "Confirm Booking"
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}