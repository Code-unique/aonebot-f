import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { AppointmentsProvider } from "@/lib/appointments-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "A One Real Estate Assistant",
  description: "Your trusted partner in Adelaide real estate",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className={inter.className}>
              <AppointmentsProvider>{children}</AppointmentsProvider>
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
