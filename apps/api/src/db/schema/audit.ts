import { uuid, timestamp, pgTable, text, jsonb, index } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth";

export const audit_logs = pgTable("audit_logs", {
    id: uuid('id').primaryKey().defaultRandom(),
    org_id: uuid('org_id').notNull().references(() => organizations.id, { onDelete: "restrict" }),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: "restrict" }),
    action: text('action').notNull(),
    resource_type: text('resource_type').notNull(),
    resource_id: uuid('resource_id').notNull(),
    metadata: jsonb('metadata'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
    index('idx_audit_logs_org_created').on(table.org_id, table.created_at.desc())
]);