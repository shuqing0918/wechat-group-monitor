import { pgTable, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

export const notifications = pgTable("notifications", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	message: text().notNull(),
	keyword: varchar({ length: 50 }).notNull(),
	source: varchar({ length: 100 }),
	isNotified: boolean("is_notified").default(false).notNull(),
	notifiedAt: timestamp("notified_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

// 配置表 - 存储短信配置等信息
export const configs = pgTable("configs", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull().unique(),
	value: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
})

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
})

// Notifications schemas
export const insertNotificationSchema = createCoercedInsertSchema(notifications).pick({
	message: true,
	keyword: true,
	source: true,
	isNotified: true,
})

export const updateNotificationSchema = createCoercedInsertSchema(notifications)
	.pick({
		isNotified: true,
		notifiedAt: true,
	})
	.partial()

// Configs schemas
export const insertConfigSchema = createCoercedInsertSchema(configs).pick({
	key: true,
	value: true,
	description: true,
})

export const updateConfigSchema = createCoercedInsertSchema(configs)
	.pick({
		value: true,
		description: true,
	})
	.partial()

// TypeScript types
export type Notification = typeof notifications.$inferSelect
export type InsertNotification = z.infer<typeof insertNotificationSchema>
export type UpdateNotification = z.infer<typeof updateNotificationSchema>

export type Config = typeof configs.$inferSelect
export type InsertConfig = z.infer<typeof insertConfigSchema>
export type UpdateConfig = z.infer<typeof updateConfigSchema>
