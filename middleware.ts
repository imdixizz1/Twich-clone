import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  // Define routes that do not require authentication
  publicRoutes: [
    "/", // Homepage
    "/api/webhooks(.*)", // Webhook routes
    "/api/uploadthing", // Upload endpoint
    "/search", // Public search page
    "/:username", // Public profile pages
    "/sign-in", // Clerk sign-in
    "/sign-up", // Clerk sign-up
  ],
})

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\..*).*)", // Exclude static files, _next, etc.
  ],
}
