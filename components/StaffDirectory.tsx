"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiPhone, FiMail, FiCalendar, FiStar, FiLoader } from "react-icons/fi"
import { getSupabaseBrowserClient, type Staff } from "@/lib/supabase"

interface StaffDirectoryProps {
  isOpen: boolean
  onClose: () => void
  onBookAppointment?: (staffId: number) => void
}

export default function StaffDirectory({ isOpen, onClose, onBookAppointment }: StaffDirectoryProps) {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleBookAppointment = (staffId: number) => {
    if (onBookAppointment) {
      onBookAppointment(staffId)
    }
    onClose()
  }

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
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Our Team of Specialists</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 max-h-[calc(80vh-64px)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiLoader className="w-8 h-8 animate-spin text-[#012169] mb-4" />
                  <p className="text-gray-500">Loading staff members...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <button className="mt-4 px-4 py-2 bg-[#012169] text-white rounded-lg" onClick={() => setError(null)}>
                    Try Again
                  </button>
                </div>
              ) : selectedStaff ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className="text-sm text-blue-600 flex items-center gap-1"
                  >
                    ← Back to all staff
                  </button>

                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={selectedStaff.image || "/placeholder.svg?height=150&width=150"}
                        alt={selectedStaff.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold">{selectedStaff.name}</h3>
                      <p className="text-gray-600 mb-2">{selectedStaff.role}</p>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                        <FiStar className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{selectedStaff.rating}</span>
                        <span className="text-gray-500 text-sm">/5</span>
                      </div>

                      <p className="mb-4">
                        <span className="font-medium">Specialty:</span>{" "}
                        {selectedStaff.specialty || "General Real Estate"}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-gray-500" />
                          <a href={`tel:${selectedStaff.phone}`} className="hover:underline">
                            {selectedStaff.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMail className="text-gray-500" />
                          <a href={`mailto:${selectedStaff.email}`} className="hover:underline">
                            {selectedStaff.email}
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookAppointment(selectedStaff.id)}
                        className="bg-[#012169] hover:bg-[#1a3a7e] text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto md:mx-0"
                      >
                        <FiCalendar />
                        Book an Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedStaff(staff)}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={staff.image || "/placeholder.svg?height=150&width=150"}
                          alt={staff.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{staff.name}</h3>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{staff.specialty || "General Real Estate"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-sm font-medium">{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
