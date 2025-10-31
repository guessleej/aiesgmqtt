import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Power Device Management
export const powerDevices = mysqlTable("powerDevices", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 64 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 255 }).notNull(),
  deviceType: varchar("deviceType", { length: 64 }).notNull(), // 'light', 'ac', 'equipment', etc.
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["on", "off", "offline"]).default("off").notNull(),
  powerRating: int("powerRating"), // Watts
  mqttTopic: varchar("mqttTopic", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PowerDevice = typeof powerDevices.$inferSelect;
export type InsertPowerDevice = typeof powerDevices.$inferInsert;

// Electricity Usage Records
export const electricityRecords = mysqlTable("electricityRecords", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  consumption: int("consumption").notNull(), // Wh (Watt-hours)
  cost: int("cost"), // cents
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ElectricityRecord = typeof electricityRecords.$inferSelect;
export type InsertElectricityRecord = typeof electricityRecords.$inferInsert;

// Water Usage Records
export const waterRecords = mysqlTable("waterRecords", {
  id: int("id").autoincrement().primaryKey(),
  location: varchar("location", { length: 255 }).notNull(),
  consumption: int("consumption").notNull(), // Liters
  cost: int("cost"), // cents
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaterRecord = typeof waterRecords.$inferSelect;
export type InsertWaterRecord = typeof waterRecords.$inferInsert;

// Air Quality Monitoring
export const airQualityRecords = mysqlTable("airQualityRecords", {
  id: int("id").autoincrement().primaryKey(),
  location: varchar("location", { length: 255 }).notNull(),
  co2: int("co2").notNull(), // ppm
  pm25: int("pm25"), // μg/m³
  pm10: int("pm10"), // μg/m³
  temperature: int("temperature"), // Celsius * 10
  humidity: int("humidity"), // Percentage * 10
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AirQualityRecord = typeof airQualityRecords.$inferSelect;
export type InsertAirQualityRecord = typeof airQualityRecords.$inferInsert;

// Carbon Emission Records
export const carbonEmissionRecords = mysqlTable("carbonEmissionRecords", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 255 }).notNull(), // 'electricity', 'water', 'transport', etc.
  emissionType: varchar("emissionType", { length: 64 }).notNull(), // 'scope1', 'scope2', 'scope3'
  amount: int("amount").notNull(), // kg CO2e * 100
  calculationMethod: text("calculationMethod"),
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CarbonEmissionRecord = typeof carbonEmissionRecords.$inferSelect;
export type InsertCarbonEmissionRecord = typeof carbonEmissionRecords.$inferInsert;