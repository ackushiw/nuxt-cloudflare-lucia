import { Lucia } from "lucia";
import { D1Adapter } from "@lucia-auth/adapter-sqlite";
import { GitHub, Google } from "arctic";
import { useEvent } from "#imports";

type H3Event = ReturnType<typeof useEvent>;

export function initializeLucia(D1: D1Database) {
  const adapter = new D1Adapter(D1, {
    user: "user",
    session: "session",
  });
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: !import.meta.dev,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
        name: attributes.name,
      };
    },
  });
}

export const github = (event: H3Event) => {
  const config = useRuntimeConfig(event);
  return new GitHub(config.githubClientId!, config.githubClientSecret!);
};

export const google = (event: H3Event) => {
  const config = useRuntimeConfig(event);
  console.log('Redirect URL', config.googleRedirectUri)
  console.log("GETTING GOOGLE AUTH ID EVENT", JSON.stringify(event, null, 2));
  
  return new Google(
    config.googleClientId!,
    config.googleClientSecret!,
    config.googleRedirectUri!
  );
};

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  name: string;
  username: string;
}
