import { sqliteTable, text, int } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text('email'),
  username: text("username").unique().notNull(),
})

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  googleAccessToken: text('google_access_token'),
  expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const oauth_account = sqliteTable("oauth_account", {
  googleAccessToken: text('google_access_token'),
  providerId: text("provider_id").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})
