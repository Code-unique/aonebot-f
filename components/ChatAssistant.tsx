"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  FiSend,
  FiUsers,
  FiUser,
  FiHome,
  FiLoader,
  FiX,
  FiMessageSquare,
  FiChevronDown,
  FiClock,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiPhone,
  FiKey,
  FiBriefcase,
  FiCheckCircle,
  FiHelpCircle,
  FiDollarSign,
  FiSearch,
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, SignInButton } from "@clerk/nextjs"
import StaffDirectory from "./StaffDirectory"
import AppointmentCalendar from "./AppointmentCalendar"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useAppointments } from "@/lib/appointments-context"

// Types
interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  loading?: boolean
  options?: ChatOption[]
}

interface ChatOption {
  id: string
  text: string
  value: string
  icon?: React.ReactNode
}

interface UserData {
  name: string
  email: string
  phone: string
  address?: string
  preference: "property-management" | "sales" | "investment" | null
}

// AI response generator with more intelligence
const getAIResponse = async (messages: any[], userData: UserData) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const lastMessage = messages[messages.length - 1]
  const userMessage = lastMessage?.content?.toLowerCase() || ""
  const userName = userData.name ? userData.name.split(" ")[0] : ""

  // Initial greeting
  if (messages.every(m => m.isBot)) {
    return {
      text: userName
        ? `Hello ${userName}! 👋 I'm Emma, your A One Real Estate assistant. How can I help you today? Are you interested in buying, selling, or managing a property?`
        : "Hello there! 👋 I'm Emma, your A One Real Estate assistant. How can I help you today? Are you interested in buying, selling, or managing a property?",
      options: [
        { id: "sales", text: "Looking to Buy/Sell", value: "sales", icon: <FiHome /> },
        { id: "property-management", text: "Property Management", value: "property-management", icon: <FiKey /> },
        { id: "investment", text: "Investment Advice", value: "investment", icon: <FiBriefcase /> },
        { id: "contact-info", text: "Provide Contact Info", value: "contact-info", icon: <FiUser /> },
      ],
    }
  }

  // Handle preference selection
if (["sales", "investment", "property-management"].includes(userMessage))
 {
    userData.preference = userMessage as any

    if (userMessage === "sales") {
      return {
        text: `Great choice! 🏠 I'd be happy to help you with property ${userMessage}. To provide you with the most relevant options, could you tell me a bit more about what you're looking for?`,
        options: [
          { id: "buy", text: "I want to buy", value: "buy", icon: <FiSearch /> },
          { id: "sell", text: "I want to sell", value: "sell", icon: <FiDollarSign /> },
        ],
      }
    } else if (userMessage === "property-management") {
      return {
        text: `Excellent! 🔑 Our property management team can help you manage your investment property efficiently. Would you like to learn more about our services or discuss your specific property?`,
        options: [
          { id: "learn-more", text: "Learn about services", value: "learn-more", icon: <FiInfo /> },
          { id: "discuss-property", text: "Discuss my property", value: "discuss-property", icon: <FiHome /> },
        ],
      }
    } else if (userMessage === "investment") {
      return {
        text: `Smart choice! 📈 Our investment advisors can help you build a profitable property portfolio. Are you a first-time investor or looking to expand your existing portfolio?`,
        options: [
          { id: "first-time", text: "First-time investor", value: "first-time", icon: <FiUser /> },
          { id: "experienced", text: "Expanding portfolio", value: "experienced", icon: <FiBriefcase /> },
        ],
      }
    }
  }

  console.log("User message:", userMessage)
console.log("Message history:", messages)

  // Handle buy/sell options
  if (userMessage === "buy") {
    return {
      text: "Great! 🏡 To help you find the perfect property, I'll need to know a bit more about your requirements. Would you like to provide some details now?",
      options: [
        { id: "provide-details", text: "Provide details now", value: "provide-details", icon: <FiInfo /> },
        { id: "browse-first", text: "Browse properties first", value: "browse-first", icon: <FiHome /> },
      ],
    }
  }

  if (userMessage === "sell") {
    return {
      text: "Excellent! 💰 Our expert agents can help you get the best price for your property. Would you like to arrange a property valuation or speak to one of our sales specialists?",
      options: [
        { id: "valuation", text: "Property valuation", value: "valuation", icon: <FiHome /> },
        { id: "speak-specialist", text: "Speak to a specialist", value: "speak-specialist", icon: <FiUser /> },
      ],
    }
  }

  // Handle property management options
  if (userMessage === "learn-more") {
    return {
      text: "Our property management services include tenant screening, rent collection, maintenance coordination, regular inspections, and financial reporting. Would you like to discuss your specific property or meet our property management team?",
      options: [
        { id: "discuss-property", text: "Discuss my property", value: "discuss-property", icon: <FiHome /> },
        { id: "meet-team", text: "Meet the team", value: "meet-team", icon: <FiUsers /> },
      ],
    }
  }

  if (userMessage === "discuss-property") {
    return {
      text: "I'd be happy to discuss your property. To provide you with the most relevant information, could you share some details about your property?",
      options: [
        {
          id: "provide-property-details",
          text: "Provide property details",
          value: "provide-property-details",
          icon: <FiInfo />,
        },
        { id: "speak-manager", text: "Speak to a property manager", value: "speak-manager", icon: <FiUser /> },
      ],
    }
  }

  // Handle investment options
  if (userMessage === "first-time" || userMessage === "experienced") {
    const investorType = userMessage === "first-time" ? "first-time investor" : "experienced investor"
    return {
      text: `As a ${investorType}, our advisors can provide tailored guidance for your investment journey. Would you like to learn about current investment opportunities or discuss your investment strategy?`,
      options: [
        { id: "opportunities", text: "Investment opportunities", value: "opportunities", icon: <FiHome /> },
        { id: "strategy", text: "Investment strategy", value: "strategy", icon: <FiBriefcase /> },
      ],
    }
  }

  // Handle form triggers
  if (
    [
      "provide-details",
      "provide-property-details",
      "valuation",
      "speak-specialist",
      "speak-manager",
      "opportunities",
      "strategy",
      "contact-info",
    ].includes(userMessage)
  ) {
    return {
      text: "To help you better, I'll need some information. Could you please fill out a quick form so we can connect you with the right specialist?",
      showForm: true,
    }
  }

  if (userMessage === "browse-first") {
    return {
      text: "No problem! You can browse our available properties on our website. When you're ready to discuss specific properties or have questions, I'm here to help. Would you like me to show you some featured properties?",
      options: [
        { id: "show-featured", text: "Show featured properties", value: "show-featured", icon: <FiHome /> },
        { id: "specific-area", text: "Search by area", value: "specific-area", icon: <FiMapPin /> },
      ],
    }
  }

  if (userMessage === "meet-team") {
    return {
      text: "Great! Our property management team has years of experience and is dedicated to maximizing your investment returns. Would you like to meet them now?",
      meetTeam: true,
    }
  }

  // Handle property requirements
  if (userMessage.includes("house") || userMessage.includes("apartment")) {
    return {
      text: `I've noted your preferences. Based on what you're looking for, I'd recommend speaking with one of our specialists who can provide personalized assistance. Would you like to book an appointment or chat with a specialist now?`,
      options: [
        { id: "book-appointment", text: "Book an appointment", value: "book-appointment", icon: <FiCalendar /> },
        { id: "chat-specialist", text: "Chat with a specialist", value: "chat-specialist", icon: <FiMessageSquare /> },
      ],
    }
  }

  if (userMessage === "book-appointment" || userMessage === "chat-specialist") {
    return {
      text: "Perfect! To connect you with the right specialist, could you please provide some contact information?",
      showForm: true,
    }
  }

  // Default responses based on context
  if (userData.preference === "sales") {
    return {
      text: `Thanks for your message about property sales. To better assist you, would you like to discuss specific properties or your requirements with one of our sales specialists?`,
      options: [
        {
          id: "specific-properties",
          text: "Discuss specific properties",
          value: "specific-properties",
          icon: <FiHome />,
        },
        { id: "sales-specialist", text: "Speak to a specialist", value: "sales-specialist", icon: <FiUser /> },
      ],
    }
  } else if (userData.preference === "property-management") {
    return {
      text: `Thanks for your interest in our property management services. Would you like to learn more about how we can help manage your property effectively?`,
      options: [
        { id: "management-services", text: "Management services", value: "management-services", icon: <FiInfo /> },
        { id: "property-manager", text: "Speak to a property manager", value: "property-manager", icon: <FiUser /> },
      ],
    }
  } else if (userData.preference === "investment") {
    return {
      text: `Thanks for your interest in property investment. Our advisors can help you identify lucrative opportunities in the Adelaide market. Would you like to discuss your investment goals?`,
      options: [
        {
          id: "investment-opportunities",
          text: "Investment opportunities",
          value: "investment-opportunities",
          icon: <FiHome />,
        },
        { id: "investment-advisor", text: "Speak to an advisor", value: "investment-advisor", icon: <FiUser /> },
      ],
    }
  }

  // Generic fallback response
  return {
    text: `Thanks for your message${userName ? ", " + userName : ""}. To better assist you, could you let me know if you're interested in property sales, property management, or investment advice?`,
    options: [
      { id: "sales", text: "Property Sales", value: "sales", icon: <FiHome /> },
      { id: "property-management", text: "Property Management", value: "property-management", icon: <FiKey /> },
      { id: "investment", text: "Investment Advice", value: "investment", icon: <FiBriefcase /> },
      { id: "contact-info", text: "Provide Contact Info", value: "contact-info", icon: <FiUser /> },
    ],
  }
}

export default function ChatAssistant() {
  const { user, isSignedIn } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    preference: null,
  })
  const [showStaff, setShowStaff] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showAppointment, setShowAppointment] = useState(false)
  const [appointmentStaffId, setAppointmentStaffId] = useState<number | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [savingUserData, setSavingUserData] = useState(false)
  const [hasInitiatedConversation, setHasInitiatedConversation] = useState(false)
  const { appointments } = useAppointments()

  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const contactFormRef = useRef<HTMLFormElement>(null)
  const propertyFormRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const supabase = getSupabaseBrowserClient()

  // Update userData when user changes
  useEffect(() => {
    if (isSignedIn && user) {
      setUserData((prev) => ({
        ...prev,
        name: user.fullName || user.firstName || (user.username as string) || prev.name,
        email: user.primaryEmailAddress?.emailAddress || prev.email,
      }))

      // Fetch user data from Supabase if they exist
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

          if (error) {
            console.log("User not found in database, will create on form submission")
            return
          }

          if (data) {
            setUserData((prev) => ({
              ...prev,
              name: data.name || prev.name,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              preference: (data.preference as any) || prev.preference,
            }))
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
        }
      }

      fetchUserData()
    }
  }, [user, isSignedIn, supabase])

  // Proactively initiate conversation after welcome screen is closed
  useEffect(() => {
    if (!showWelcome && !hasInitiatedConversation && messages.length === 0) {
      setHasInitiatedConversation(true)

      // Add initial greeting message
      const initialMessage = {
        id: "initial",
        content: "...",
        isBot: true,
        timestamp: new Date(),
        loading: true,
      }

      setMessages([initialMessage])

      // Simulate typing and then show the actual message
      setTimeout(async () => {
        const response = await getAIResponse([], userData)

        if (typeof response === "object" && "text" in response) {
          setMessages([
            {
              id: "welcome",
              content: response.text,
              isBot: true,
              timestamp: new Date(),
              options: response.options,
            },
          ])
        } else {
          setMessages([
            {
              id: "welcome",
              content: "Hi there! 👋 I'm Emma, your A One Real Estate assistant. How can I help you today?",
              isBot: true,
              timestamp: new Date(),
            },
          ])
        }
      }, 1000)
    }
  }, [showWelcome, hasInitiatedConversation, messages.length, userData])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      const container = chatRef.current
      if (!container) return
      const { scrollTop, scrollHeight, clientHeight } = container
      setIsNearBottom(scrollTop + clientHeight >= scrollHeight - 100)
    }
    const container = chatRef.current
    container?.addEventListener("scroll", onScroll)
    return () => container?.removeEventListener("scroll", onScroll)
  }, [])

  // Auto scroll if near bottom
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, showStaff, isNearBottom])

  // Autofocus on form
  useEffect(() => {
    if (showContactForm) {
      nameInputRef.current?.focus()
    }
  }, [showContactForm])

  // If user is not signed in, show contact form after a short delay
  useEffect(() => {
    if (!isSignedIn && !showContactForm && !formSubmitted && !showWelcome && messages.length > 1) {
      const timer = setTimeout(() => {
        if (!userData.name || !userData.email || !userData.phone) {
          setShowContactForm(true)
        }
      }, 10000) // Show after 10 seconds of conversation
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, showContactForm, formSubmitted, showWelcome, messages.length, userData])

  // Show appointment reminder if user has upcoming appointments
  useEffect(() => {
    if (appointments.length > 0 && !showWelcome && messages.length > 1 && !loading) {
      // Find the next upcoming appointment
      const now = new Date()
      const upcomingAppointments = appointments
        .filter((apt) => new Date(apt.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingAppointments.length > 0 && messages.length < 5) {
        const nextAppointment = upcomingAppointments[0]
        const appointmentDate = new Date(nextAppointment.date)

        // Add a reminder message after a delay
        setTimeout(() => {
          const reminderMessage = {
            id: crypto.randomUUID(),
            content: `By the way, I noticed you have an upcoming appointment with ${nextAppointment.staffName} on ${appointmentDate.toLocaleDateString()} at ${nextAppointment.time}. Is there anything specific you'd like to discuss during this appointment?`,
            isBot: true,
            timestamp: new Date(),
            options: [
              {
                id: "appointment-yes",
                text: "Yes, I have questions",
                value: "appointment-yes",
                icon: <FiHelpCircle />,
              },
              { id: "appointment-no", text: "No, I'm all set", value: "appointment-no", icon: <FiCheckCircle /> },
            ],
          }

          setMessages((prev) => [...prev, reminderMessage])
        }, 5000) // Show after 5 seconds
      }
    }
  }, [appointments, showWelcome, messages.length, loading])

  const handleOptionClick = async (option: ChatOption) => {
    if (!option) return

    // If the option is contact-info, show the contact form
    if (option.value === "contact-info") {
      setShowContactForm(true)
      return
    }

    // Handle appointment reminder responses
    if (option.value === "appointment-yes") {
      const response = {
        id: crypto.randomUUID(),
        content:
          "Great! Feel free to ask any questions you have about your upcoming appointment, and I'll make sure to note them for your specialist.",
        isBot: true,
        timestamp: new Date(),
      }

      // Add user message with selected option
      const userMsg: Message = {
        id: crypto.randomUUID(),
        content: "I have some questions about my appointment",
        isBot: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg, response])
      return
    }

    if (option.value === "appointment-no") {
      const response = {
        id: crypto.randomUUID(),
        content:
          "Perfect! We look forward to seeing you at your appointment. Is there anything else I can help you with today?",
        isBot: true,
        timestamp: new Date(),
        options: [
          { id: "sales", text: "Property Sales", value: "sales", icon: <FiHome /> },
          { id: "property-management", text: "Property Management", value: "property-management", icon: <FiKey /> },
          { id: "investment", text: "Investment Advice", value: "investment", icon: <FiBriefcase /> },
        ],
      }

      // Add user message with selected option
      const userMsg: Message = {
        id: crypto.randomUUID(),
        content: "I'm all set for my appointment",
        isBot: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg, response])
      return
    }

    // Add user message with selected option
    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: option.value,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // Typing simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "typing",
          content: "",
          isBot: true,
          loading: true,
          timestamp: new Date(),
        },
      ])
    }, 300)

    try {
      const formattedMessages = [
        { role: "system", content: "You are Emma, a digital assistant for A One Real Estate in Adelaide." },
        ...messages.map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.content })),
        { role: "user", content: option.value },
      ]

      const aiResponse = await getAIResponse(formattedMessages, userData)

      if (typeof aiResponse === "object" && "text" in aiResponse) {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          content: aiResponse.text,
          isBot: true,
          timestamp: new Date(),
          options: aiResponse.options,
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botMsg])

        // Handle special actions
        if (aiResponse.showForm) {
          setTimeout(() => setShowContactForm(true), 600)
        }

        if (aiResponse.meetTeam) {
          setTimeout(() => setShowStaff(true), 600)
        }
      } else {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          content: aiResponse || "I'm having trouble responding.",
          isBot: true,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botMsg])
      }
    } catch (err) {
      console.error("AI Error:", err)
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "typing"),
        {
          id: crypto.randomUUID(),
          content: "⚠️ I'm having trouble responding. Please try again shortly.",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    // Close welcome message if still open
    if (showWelcome) {
      setShowWelcome(false)
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Typing simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "typing",
          content: "",
          isBot: true,
          loading: true,
          timestamp: new Date(),
        },
      ])
    }, 300)

    try {
      const formattedMessages = [
        { role: "system", content: "You are Emma, a digital assistant for A One Real Estate in Adelaide." },
        ...messages.map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.content })),
        { role: "user", content: input },
      ]

      const aiResponse = await getAIResponse(formattedMessages, userData)

      if (typeof aiResponse === "object" && "text" in aiResponse) {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          content: aiResponse.text,
          isBot: true,
          timestamp: new Date(),
          options: aiResponse.options,
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botMsg])

        // Handle special actions
        if (aiResponse.showForm) {
          setTimeout(() => setShowContactForm(true), 600)
        }

        if (aiResponse.meetTeam) {
          setTimeout(() => setShowStaff(true), 600)
        }
      } else {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          content: aiResponse || "I'm having trouble responding.",
          isBot: true,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botMsg])
      }
    } catch (err) {
      console.error("AI Error:", err)
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "typing"),
        {
          id: crypto.randomUUID(),
          content: "⚠️ I'm having trouble responding. Please try again shortly.",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveUserDataToSupabase = async () => {
    if (!userData.name.trim() || !userData.email.trim() || !userData.phone.trim()) {
      return false
    }

    setSavingUserData(true)

    try {
      if (isSignedIn && user) {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 is "not found" error
          throw fetchError
        }

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from("users")
            .update({
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address,
              preference: userData.preference,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id)

          if (updateError) throw updateError
        } else {
          // Create new user
          const { error: insertError } = await supabase.from("users").insert({
            clerk_id: user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            preference: userData.preference,
          })

          if (insertError) throw insertError
        }
      } else {
        // Guest user - just create a record without clerk_id
        const { error: insertError } = await supabase.from("users").insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          preference: userData.preference,
        })

        if (insertError) throw insertError
      }

      return true
    } catch (err) {
      console.error("Error saving user data:", err)
      return false
    } finally {
      setSavingUserData(false)
    }
  }

  const handleContactFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    if (!userData.name.trim()) {
      setFormError("Please enter your full name")
      return
    }

    if (!userData.email.trim()) {
      setFormError("Please enter your email address")
      return
    }

    if (!userData.phone.trim()) {
      setFormError("Please enter your phone number")
      return
    }

    try {
      contactFormRef.current?.classList.add("submitting")

      // Save user data to Supabase
      const saved = await saveUserDataToSupabase()

      if (!saved) {
        throw new Error("Failed to save your information")
      }

      const thankYouMessage: Message = {
        id: crypto.randomUUID(),
        content: `Thanks ${userData.name}! 🎉 I've received your contact information. Would you like to book an appointment with one of our specialists or meet our team?`,
        isBot: true,
        timestamp: new Date(),
        options: [
          { id: "book-appointment", text: "Book an appointment", value: "book-appointment", icon: <FiCalendar /> },
          { id: "meet-team", text: "Meet our team", value: "meet-team", icon: <FiUsers /> },
        ],
      }

      setMessages((prev) => [...prev, thankYouMessage])
      setShowContactForm(false)
      setFormSubmitted(true)
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("Submission failed. Please try again.")
    } finally {
      contactFormRef.current?.classList.remove("submitting")
    }
  }

  const handlePropertyFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    try {
      propertyFormRef.current?.classList.add("submitting")

      // Save user data to Supabase if we have it
      if (userData.name && userData.email && userData.phone) {
        await saveUserDataToSupabase()
      }

      const propertyType = (document.getElementById("propertyType") as HTMLSelectElement).value
      const location = (document.getElementById("location") as HTMLInputElement).value

      const thankYouMessage: Message = {
        id: crypto.randomUUID(),
        content: `Thanks for providing your property details! I've noted that you're looking for a ${propertyType} in ${location}. Would you like to book an appointment with one of our specialists to discuss this further?`,
        isBot: true,
        timestamp: new Date(),
        options: [
          { id: "book-appointment", text: "Book an appointment", value: "book-appointment", icon: <FiCalendar /> },
          { id: "meet-team", text: "Meet our team", value: "meet-team", icon: <FiUsers /> },
        ],
      }

      setMessages((prev) => [...prev, thankYouMessage])
      setShowPropertyForm(false)
      setFormSubmitted(true)
    } catch {
      setFormError("Submission failed. Please try again.")
    } finally {
      propertyFormRef.current?.classList.remove("submitting")
    }
  }

  // Add this function to handle booking appointments with specific staff
  const handleBookAppointment = (staffId?: number) => {
  // If a staff ID is provided (e.g. via Meet Our Team), use it.
  // If not, default to the first available staff member.
  if (staffId) {
    setAppointmentStaffId(staffId)
  } else {
    // Attempt to preload staff list from Supabase
    const preloadStaff = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("staff").select("*").order("name")
        if (error) throw error

        if (data && data.length > 0) {
          setAppointmentStaffId(data[0].id) // Default to first staff member
        }
      } catch (err) {
        console.error("Error preloading staff:", err)
        setAppointmentStaffId(null) // fallback to null if nothing is found
      }
    }

    preloadStaff()
  }

  setShowAppointment(true)
}

  return (
    <div className="aone-chat-container h-full">
      {/* Header */}
      <motion.header
        className="aone-header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        style={{
          background: "linear-gradient(to right, #012169, #1a3a7e)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="header-brand">
          <FiHome className="aone-icon" />
          <h1 className="text-xl font-bold">A One Real Estate Assistant</h1>
          <div className="online-indicator" />
        </div>
      </motion.header>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 z-10 bg-gradient-to-b from-[#012169]/95 to-[#012169]/80 flex flex-col items-center justify-center text-white p-6 text-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold mb-4">Welcome to A One Real Estate</h2>
              <p className="text-white/80 mb-8">
                I'm Emma, your personal real estate assistant. I'm here to help you find the perfect property solution
                in Adelaide.
              </p>

              {isSignedIn ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWelcome(false)}
                  className="bg-[#FF6B00] hover:bg-[#ff8642] text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  Start Chatting <FiChevronDown />
                </motion.button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* Fix for hydration error - don't use motion.button inside SignInButton */}
                  <SignInButton mode="modal">
                    <button className="bg-[#FF6B00] hover:bg-[#ff8642] text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2">
                      Sign In
                    </button>
                  </SignInButton>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowWelcome(false)
                      // Show contact form immediately for non-signed in users
                      setTimeout(() => setShowContactForm(true), 5000)
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2"
                  >
                    Continue as Guest
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <main
        className="aone-chat-messages"
        ref={chatRef}
        aria-live="polite"
        style={{
          background: "linear-gradient(135deg, #f0f4ff, #ffffff)",
        }}
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`aone-message ${msg.isBot ? "bot" : "user"} ${msg.loading ? "loading" : ""}`}
            >
              {msg.isBot && !msg.loading && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "12px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#012169",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  E
                </div>
              )}

              <div className="message-content">
                {msg.loading ? (
                  <div className="typing-loader">
                    <FiLoader className="animate-spin" />
                    <span>Emma is typing...</span>
                  </div>
                ) : (
                  <>
                    <p style={{ lineHeight: "1.5" }}>{msg.content}</p>

                    {/* Option buttons */}
                    {msg.isBot && msg.options && msg.options.length > 0 && (
                      <div className="message-options mt-3 flex flex-wrap gap-2">
                        {msg.options.map((option) => (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOptionClick(option)}
                            className="bg-white border border-gray-200 hover:border-[#012169] text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            {option.icon}
                            {option.text}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <time className="message-time" title={msg.timestamp.toLocaleString()}>
                  <FiClock style={{ width: "12px", height: "12px" }} />
                  {msg.timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* CTA buttons */}
        {userData.preference && !showContactForm && !showPropertyForm && formSubmitted && (
          <motion.div className="aone-cta-container" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <motion.button
              className="aone-cta-button"
              onClick={() => setShowStaff(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(to right, #FF6B00, #ff8642)",
                color: "white",
              }}
            >
              <FiUsers />
              <span>Meet Our Specialists</span>
            </motion.button>

            <motion.button
              className="aone-cta-button"
              onClick={() => handleBookAppointment()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(to right, #012169, #1a3a7e)",
                color: "white",
              }}
            >
              <FiCalendar />
              <span>Book an Appointment</span>
            </motion.button>
          </motion.div>
        )}

        {/* Upcoming Appointments Reminder (if any) */}
        {appointments.length > 0 && !showContactForm && !showPropertyForm && (
          <div className="upcoming-appointments">{/* This will be populated dynamically via the useEffect */}</div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Contact Form */}
      <AnimatePresence>
        {showContactForm && (
          <motion.form
            ref={contactFormRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onSubmit={handleContactFormSubmit}
            className="aone-form-container"
          >
            <button
              type="button"
              className="aone-form-close"
              onClick={() => setShowContactForm(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                color: "#333",
                cursor: "pointer",
              }}
            >
              <FiX />
            </button>

            <div className="form-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                className="form-icon"
                style={{
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #012169, #1a3a7e)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                <FiUser />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Your Contact Information
              </h2>
              <p style={{ color: "#666" }}>We'll connect you with the right expert</p>
            </div>

            <div className="form-body">
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Full Name *
                </label>
                <div className="input-with-icon">
                  <FiUser
                    className="input-icon"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                    }}
                  />
                  <input
                    id="name"
                    ref={nameInputRef}
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="glow-on-focus"
                    required
                    aria-required="true"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                    }}
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Email Address *
                </label>
                <div className="input-with-icon">
                  <FiMail
                    className="input-icon"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="glow-on-focus"
                    required
                    aria-required="true"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                    }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="phone"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Phone Number *
                </label>
                <div className="input-with-icon">
                  <FiPhone
                    className="input-icon"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                    }}
                  />
                  <input
                    id="phone"
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="glow-on-focus"
                    required
                    aria-required="true"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                    }}
                    placeholder="0400 123 456"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="address"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Property Address (Optional)
                </label>
                <div className="input-with-icon">
                  <FiMapPin
                    className="input-icon"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                    }}
                  />
                  <input
                    id="address"
                    type="text"
                    value={userData.address || ""}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    className="glow-on-focus"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                    }}
                    placeholder="123 Main Street, Adelaide"
                  />
                </div>
              </div>

              {formError && (
                <motion.div
                  className="form-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: "#fff0f0",
                    color: "#dc2626",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiInfo />
                  {formError}
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              className="aone-form-submit"
              whileHover={{ scale: 1.02 }}
              disabled={savingUserData}
              style={{
                background: "linear-gradient(to right, #012169, #1a3a7e)",
                color: "white",
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: savingUserData ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "1rem",
                opacity: savingUserData ? 0.7 : 1,
              }}
            >
              {savingUserData ? "Submitting..." : "Submit"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Property Requirements Form - Simplified */}
      <AnimatePresence>
        {showPropertyForm && (
          <motion.form
            ref={propertyFormRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onSubmit={handlePropertyFormSubmit}
            className="aone-form-container"
          >
            <button
              type="button"
              className="aone-form-close"
              onClick={() => setShowPropertyForm(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                color: "#333",
                cursor: "pointer",
              }}
            >
              <FiX />
            </button>

            <div className="form-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                className="form-icon"
                style={{
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #012169, #1a3a7e)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                <FiHome />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Your Property Requirements
              </h2>
              <p style={{ color: "#666" }}>Help us find your perfect property</p>
            </div>

            <div className="form-body">
              <div className="grid grid-cols-1 gap-4">
                <div className="form-group">
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    id="propertyType"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012169] focus:border-transparent"
                    required
                  >
                    <option value="">Select property type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012169] focus:border-transparent"
                    placeholder="Suburb or area"
                    required
                  />
                </div>
              </div>

              {formError && (
                <motion.div
                  className="form-error mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: "#fff0f0",
                    color: "#dc2626",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiInfo />
                  {formError}
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              className="aone-form-submit"
              whileHover={{ scale: 1.02 }}
              disabled={savingUserData}
              style={{
                background: "linear-gradient(to right, #012169, #1a3a7e)",
                color: "white",
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: savingUserData ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "1rem",
                opacity: savingUserData ? 0.7 : 1,
              }}
            >
              {savingUserData ? "Submitting..." : "Submit Requirements"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Appointment Calendar */}
      <AppointmentCalendar
        isOpen={showAppointment}
        onClose={() => setShowAppointment(false)}
        initialStaffId={appointmentStaffId}
      />

      {/* Staff Directory */}
      <StaffDirectory
        isOpen={showStaff}
        onClose={() => setShowStaff(false)}
        onBookAppointment={handleBookAppointment}
      />

      {/* Input */}
      <div className="aone-input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about real estate..."
          disabled={loading}
          className="glow-on-focus"
          style={{
            flex: 1,
            padding: "0.75rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            outline: "none",
            transition: "all 0.2s",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        />
        <button
          onClick={handleSend}
          className="aone-send-button"
          disabled={loading || !input.trim()}
          style={{
            background: input.trim() ? "linear-gradient(to right, #FF6B00, #ff8642)" : "#ccc",
            color: "white",
            cursor: input.trim() ? "pointer" : "not-allowed",
            boxShadow: input.trim() ? "0 4px 10px rgba(255, 107, 0, 0.3)" : "none",
          }}
        >
          <FiSend />
        </button>
      </div>
    </div>
  )
}
