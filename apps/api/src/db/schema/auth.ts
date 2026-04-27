import { pgTable, text, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});


export const organizations = pgTable("organizations", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    plan: text('plan').notNull().default('free'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});


export const memberships = pgTable("memberships", {
    org_id: uuid('org_id').notNull().references(() => organizations.id, { onDelete: "restrict" }),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
    primaryKey({ columns: [table.org_id, table.user_id] })
]);