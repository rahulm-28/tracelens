import { pgTable, text, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { organizations } from "./auth";

export const projects = pgTable("projects", {
    id: uuid('id').primaryKey().defaultRandom(),
    org_id: uuid('org_id').notNull().references(() => organizations.id, { onDelete: "restrict" }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    archived_at: timestamp('archived_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [unique().on(table.org_id, table.slug)]);


export const api_keys = pgTable("api_keys", {
    id: uuid('id').primaryKey().defaultRandom(),
    project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: "cascade" }),
    hashed_key: text('hashed_key').notNull().unique(),
    prefix: text('prefix').notNull(),
    name: text('name'),
    last_used_at: timestamp('last_used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revoked_at: timestamp('revoked_at', { withTimezone: true })
});