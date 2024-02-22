import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { google } from "@/server/utils/auth";
import { eq, sql, and } from "drizzle-orm";
import { oauth_account, user } from "@/server/db/schema";

export default defineEventHandler(async (event) => {
  console.log('GOOGLE CALLBACK EVENT')
  const lucia = event.context.lucia;
  const db = event.context.db;
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, "google_oauth_state") ?? null; // Change cookie name for Google OAuth

  
  if (!code || !state || !storedState || state !== storedState) {
    console.log('GOOGLE CALLBACK EVENT ERROR 400')
    throw createError({
      status: 400,
    });
  }

  

  try {
    const tokens = await google(event).validateAuthorizationCode(
      code,
      "password123"
    ); // Assuming you have a function to validate the authorization code for Google OAuth
    const googleUser = await $fetch<GoogleUser>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    console.log("GOOGLE USER");
    console.dir(googleUser);
    interface GoogleUser {
      sub: "115943876575256176275";
      name: "Alexander Kushi-Willis";
      given_name: "Alexander";
      family_name: "Kushi-Willis";
      picture: "https://lh3.googleusercontent.com/a/ACg8ocIyDs7MH3Z2oQ0GFwiHMCIoCVKlsLcyKp0aCHjPmDRWE1AQ=s96-c";
      email: "ackw.kushi@gmail.com";
      email_verified: true;
      locale: "en";
    }
    const existingUser = await db
      .select()
      .from(oauth_account)
      .where(
        and(
          eq(oauth_account.providerId, "google"), // Change providerId for Google
          eq(oauth_account.providerUserId, sql.placeholder("id"))
        )
      )
      .prepare()
      .get({ id: googleUser.sub }); // Assuming 'sub' is the unique identifier for Google users

    if (existingUser) {
      const session = await lucia.createSession(existingUser.userId, {
        google_access_token: tokens.accessToken,
      });

      db.update(oauth_account).set({
        googleAccessToken: tokens.accessToken,
      }).where(
        and(
          eq(oauth_account.providerId, "google"), // Change providerId for Google
          eq(oauth_account.providerUserId, sql.placeholder("id"))
        )
      ).prepare().run({ id: googleUser.sub 
      })

      appendHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
      return sendRedirect(event, "/");
    }

    const userId = generateId(15);
    console.log("GOOGLE USER", JSON.stringify(googleUser, null, 2));
    await db.batch([
      db.insert(user).values({
        id: userId,
        email: googleUser.email,
        name: googleUser.name, // Assuming you want to use the Google user's name as the username
        username: googleUser.email, // Assuming you want to use the Google user's name as the username
      }),
      db.insert(oauth_account).values({
        googleAccessToken: tokens.accessToken,
        providerId: "google", // Change providerId for Google
        providerUserId: googleUser.sub, // Assuming 'sub' is the unique identifier for Google users
        userId,
      }),
    ]);
    const session = await lucia.createSession(userId, {
      google_access_token: tokens.accessToken,
    });
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    console
    return sendRedirect(event, "/");
  } catch (e) {
    console.error(e);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      throw createError({
        status: 400,
      });
    }
    throw createError({
      status: 500,
    });
  }
});
