import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usageLimits = sqliteTable("usage_limits", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("idx_usage_limits_expires_at").on(table.expiresAt)]);
