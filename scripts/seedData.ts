import { drizzle } from "drizzle-orm/mysql2";
import { powerDevices, electricityRecords, waterRecords, airQualityRecords, carbonEmissionRecords } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedData() {
  console.log("🌱 Starting to seed data...");

  // Add power devices
  const devices = [
    {
      deviceId: "device_001",
      deviceName: "辦公室照明",
      deviceType: "light",
      location: "1樓辦公區",
      status: "off" as const,
      powerRating: 200,
      mqttTopic: "carbon/device/light/001",
    },
    {
      deviceId: "device_002",
      deviceName: "空調系統A",
      deviceType: "ac",
      location: "1樓會議室",
      status: "off" as const,
      powerRating: 3500,
      mqttTopic: "carbon/device/ac/002",
    },
    {
      deviceId: "device_003",
      deviceName: "生產設備1號",
      deviceType: "equipment",
      location: "生產車間A",
      status: "on" as const,
      powerRating: 5000,
      mqttTopic: "carbon/device/equipment/003",
    },
    {
      deviceId: "device_004",
      deviceName: "走廊照明",
      deviceType: "light",
      location: "2樓走廊",
      status: "on" as const,
      powerRating: 150,
      mqttTopic: "carbon/device/light/004",
    },
    {
      deviceId: "device_005",
      deviceName: "空調系統B",
      deviceType: "ac",
      location: "2樓辦公區",
      status: "off" as const,
      powerRating: 4000,
      mqttTopic: "carbon/device/ac/005",
    },
    {
      deviceId: "device_006",
      deviceName: "伺服器機房",
      deviceType: "equipment",
      location: "地下室機房",
      status: "on" as const,
      powerRating: 8000,
      mqttTopic: "carbon/device/equipment/006",
    },
  ];

  console.log("📱 Adding power devices...");
  for (const device of devices) {
    await db.insert(powerDevices).values(device);
    console.log(`  ✓ Added device: ${device.deviceName}`);
  }

  // Add electricity records (last 30 days)
  console.log("⚡ Adding electricity records...");
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);

    await db.insert(electricityRecords).values({
      deviceId: 1,
      consumption: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 Wh
      cost: Math.floor(Math.random() * 500) + 300,
      startTime,
      endTime,
    });
  }
  console.log("  ✓ Added 30 days of electricity records");

  // Add water records
  console.log("💧 Adding water records...");
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    await db.insert(waterRecords).values({
      location: "主樓用水",
      consumption: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 L
      cost: Math.floor(Math.random() * 200) + 100,
      recordedAt: date,
    });
  }
  console.log("  ✓ Added 30 days of water records");

  // Add air quality records
  console.log("🌬️ Adding air quality records...");
  for (let i = 0; i < 100; i++) {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - i * 5); // Every 5 minutes

    await db.insert(airQualityRecords).values({
      location: "辦公區",
      co2: Math.floor(Math.random() * 200) + 400, // 400-600 ppm
      pm25: Math.floor(Math.random() * 30) + 10, // 10-40 μg/m³
      pm10: Math.floor(Math.random() * 50) + 20, // 20-70 μg/m³
      temperature: Math.floor(Math.random() * 50) + 220, // 22-27°C * 10
      humidity: Math.floor(Math.random() * 200) + 400, // 40-60% * 10
      recordedAt: date,
    });
  }
  console.log("  ✓ Added 100 air quality records");

  // Add carbon emission records
  console.log("🍃 Adding carbon emission records...");
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Scope 1 - Direct emissions
    await db.insert(carbonEmissionRecords).values({
      source: "natural_gas",
      emissionType: "scope1",
      amount: Math.floor(Math.random() * 5000) + 3000, // 30-80 kg CO2e * 100
      calculationMethod: "Natural gas combustion",
      recordedAt: date,
    });

    // Scope 2 - Electricity
    await db.insert(carbonEmissionRecords).values({
      source: "electricity",
      emissionType: "scope2",
      amount: Math.floor(Math.random() * 10000) + 5000, // 50-150 kg CO2e * 100
      calculationMethod: "Grid electricity consumption",
      recordedAt: date,
    });

    // Scope 3 - Other indirect
    await db.insert(carbonEmissionRecords).values({
      source: "water",
      emissionType: "scope3",
      amount: Math.floor(Math.random() * 2000) + 1000, // 10-30 kg CO2e * 100
      calculationMethod: "Water supply and treatment",
      recordedAt: date,
    });
  }
  console.log("  ✓ Added 90 carbon emission records");

  console.log("✅ Data seeding completed successfully!");
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  });
