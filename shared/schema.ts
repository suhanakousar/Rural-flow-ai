import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const dashboardSettings = pgTable("dashboard_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  theme: text("theme").notNull().default("dark"),
  layout: text("layout").notNull().default("default"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDashboardSettingsSchema = createInsertSchema(dashboardSettings).pick({
  userId: true,
  theme: true,
  layout: true,
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  icon: text("icon").notNull(),
  resolved: boolean("resolved").notNull().default(false),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  type: true,
  title: true,
  location: true,
  icon: true,
});

export const irrigationZones = pgTable("irrigation_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(false),
  duration: text("duration").notNull().default("0 min"),
});

export const insertIrrigationZoneSchema = createInsertSchema(irrigationZones).pick({
  name: true,
  active: true,
  duration: true,
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  content: true,
  sender: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DashboardSettings = typeof dashboardSettings.$inferSelect;
export type InsertDashboardSettings = z.infer<typeof insertDashboardSettingsSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type IrrigationZone = typeof irrigationZones.$inferSelect;
export type InsertIrrigationZone = z.infer<typeof insertIrrigationZoneSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
