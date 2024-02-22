import { generateState } from "arctic";
import { github } from "@/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const state = generateState();
    const url = await github(event).createAuthorizationURL(state);

    // return {
    //   url: url.toString(),
    // };
    // }

    setCookie(event, "github_oauth_state", state, {
      path: "/",
      secure: process?.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    })

    await sendRedirect(event, url.toString(), 302);
  } catch (error) {
    console.error(error);
    return {
      error,
      message: error?.message,
    };
  }
});
