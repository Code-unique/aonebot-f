import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api(.*)"])

export default clerkMiddleware((auth, req) => {
  // All routes are public in this simplified app
  return
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
