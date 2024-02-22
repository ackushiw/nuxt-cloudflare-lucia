import { generateState } from "arctic"
import { google } from "@/server/utils/auth"

export default defineEventHandler(async (event) => {
  const state = generateState()
  const url = await google(event).createAuthorizationURL(state, 'password123', {
    scopes: ["email", "profile", "https://www.googleapis.com/auth/gmail.readonly"]
  })
  
  setCookie(event, "google_oauth_state", state, {
    path: "/",
    secure: process?.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  await sendRedirect(event, url.toString(), 302)
})
