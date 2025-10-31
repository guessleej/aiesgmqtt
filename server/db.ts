import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Power Device Queries
import { powerDevices, electricityRecords, waterRecords, airQualityRecords, carbonEmissionRecords } from '../drizzle/schema';
import { desc, and, gte, lte, sql } from 'drizzle-orm';

export async function getAllPowerDevices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(powerDevices);
}

export async function getPowerDeviceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(powerDevices).where(eq(powerDevices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPowerDeviceByDeviceId(deviceId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(powerDevices).where(eq(powerDevices.deviceId, deviceId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePowerDeviceStatus(deviceId: string, status: 'on' | 'off' | 'offline') {
  const db = await getDb();
  if (!db) return false;
  await db.update(powerDevices).set({ status, updatedAt: new Date() }).where(eq(powerDevices.deviceId, deviceId));
  return true;
}

// Electricity Records Queries
export async function getElectricityRecords(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(electricityRecords);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(electricityRecords.startTime, startDate),
      lte(electricityRecords.endTime, endDate)
    )) as any;
  }
  
  return await query.orderBy(desc(electricityRecords.createdAt));
}

export async function getTotalElectricityConsumption(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ total: sql<number>`SUM(${electricityRecords.consumption})` }).from(electricityRecords);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(electricityRecords.startTime, startDate),
      lte(electricityRecords.endTime, endDate)
    )) as any;
  }
  
  const result = await query;
  return result[0]?.total || 0;
}

// Water Records Queries
export async function getWaterRecords(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(waterRecords);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(waterRecords.recordedAt, startDate),
      lte(waterRecords.recordedAt, endDate)
    )) as any;
  }
  
  return await query.orderBy(desc(waterRecords.createdAt));
}

export async function getTotalWaterConsumption(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ total: sql<number>`SUM(${waterRecords.consumption})` }).from(waterRecords);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(waterRecords.recordedAt, startDate),
      lte(waterRecords.recordedAt, endDate)
    )) as any;
  }
  
  const result = await query;
  return result[0]?.total || 0;
}

// Air Quality Records Queries
export async function getAirQualityRecords(location?: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(airQualityRecords);
  
  const conditions = [];
  if (location) conditions.push(eq(airQualityRecords.location, location));
  if (startDate) conditions.push(gte(airQualityRecords.recordedAt, startDate));
  if (endDate) conditions.push(lte(airQualityRecords.recordedAt, endDate));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(airQualityRecords.recordedAt));
}

export async function getLatestAirQuality(location?: string) {
  const db = await getDb();
  if (!db) return null;
  
  let query = db.select().from(airQualityRecords);
  
  if (location) {
    query = query.where(eq(airQualityRecords.location, location)) as any;
  }
  
  const result = await query.orderBy(desc(airQualityRecords.recordedAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Carbon Emission Records Queries
export async function getCarbonEmissionRecords(source?: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(carbonEmissionRecords);
  
  const conditions = [];
  if (source) conditions.push(eq(carbonEmissionRecords.source, source));
  if (startDate) conditions.push(gte(carbonEmissionRecords.recordedAt, startDate));
  if (endDate) conditions.push(lte(carbonEmissionRecords.recordedAt, endDate));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(carbonEmissionRecords.recordedAt));
}

export async function getTotalCarbonEmissions(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ total: sql<number>`SUM(${carbonEmissionRecords.amount})` }).from(carbonEmissionRecords);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(carbonEmissionRecords.recordedAt, startDate),
      lte(carbonEmissionRecords.recordedAt, endDate)
    )) as any;
  }
  
  const result = await query;
  return (result[0]?.total || 0) / 100; // Convert back from cents
}

export async function getCarbonEmissionsByType(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { scope1: 0, scope2: 0, scope3: 0 };
  
  let query = db.select({
    emissionType: carbonEmissionRecords.emissionType,
    total: sql<number>`SUM(${carbonEmissionRecords.amount})`
  }).from(carbonEmissionRecords).groupBy(carbonEmissionRecords.emissionType);
  
  if (startDate && endDate) {
    query = query.where(and(
      gte(carbonEmissionRecords.recordedAt, startDate),
      lte(carbonEmissionRecords.recordedAt, endDate)
    )) as any;
  }
  
  const result = await query;
  
  const emissions = { scope1: 0, scope2: 0, scope3: 0 };
  result.forEach(row => {
    if (row.emissionType === 'scope1') emissions.scope1 = (row.total || 0) / 100;
    if (row.emissionType === 'scope2') emissions.scope2 = (row.total || 0) / 100;
    if (row.emissionType === 'scope3') emissions.scope3 = (row.total || 0) / 100;
  });
  
  return emissions;
}
