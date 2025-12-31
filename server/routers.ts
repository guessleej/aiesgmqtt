import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  exportToCSV,
  exportToExcel,
  generateCarbonEmissionReportData,
  generateDeviceEnergyReportData,
  generateMqttStatsReportData,
  generateComprehensiveReport,
  type CarbonEmissionReport,
  type DeviceEnergyData,
  type MqttMessageStats
} from "./exportService";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard router
  dashboard: router({
    getOverview: publicProcedure.query(async () => {
      const { getAllPowerDevices, getTotalElectricityConsumption, getTotalWaterConsumption, getLatestAirQuality, getTotalCarbonEmissions, getCarbonEmissionsByType } = await import('./db');
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [devices, electricityTotal, waterTotal, airQuality, carbonTotal, carbonByType] = await Promise.all([
        getAllPowerDevices(),
        getTotalElectricityConsumption(startOfMonth, now),
        getTotalWaterConsumption(startOfMonth, now),
        getLatestAirQuality(),
        getTotalCarbonEmissions(startOfMonth, now),
        getCarbonEmissionsByType(startOfMonth, now),
      ]);
      
      return {
        electricity: {
          total: electricityTotal,
          unit: 'kWh',
          devices: devices.length,
          activeDevices: devices.filter(d => d.status === 'on').length,
        },
        water: {
          total: waterTotal,
          unit: 'L',
        },
        airQuality: airQuality ? {
          co2: airQuality.co2,
          pm25: airQuality.pm25,
          pm10: airQuality.pm10,
          temperature: airQuality.temperature ? airQuality.temperature / 10 : null,
          humidity: airQuality.humidity ? airQuality.humidity / 10 : null,
          location: airQuality.location,
          recordedAt: airQuality.recordedAt,
        } : null,
        carbon: {
          total: carbonTotal,
          unit: 'kg CO2e',
          byType: carbonByType,
        },
      };
    }),
  }),
  
  // Power devices router
  powerDevices: router({
    list: publicProcedure.query(async () => {
      const { getAllPowerDevices } = await import('./db');
      return await getAllPowerDevices();
    }),
    
    toggle: publicProcedure
      .input(z.object({
        deviceId: z.string(),
        command: z.enum(['on', 'off']),
      }))
      .mutation(async ({ input }) => {
        const { publishDeviceCommand } = await import('./mqttService');
        const success = await publishDeviceCommand(input.deviceId, input.command);
        return { success };
      }),
  }),
  
  // Export router
  export: router({
    carbonReport: publicProcedure
      .input(z.object({
        format: z.enum(['csv', 'excel']),
        period: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { getTotalElectricityConsumption, getTotalWaterConsumption, getTotalCarbonEmissions, getCarbonEmissionsByType, getAllPowerDevices } = await import('./db');
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const [electricityTotal, waterTotal, carbonTotal, carbonByType, devices] = await Promise.all([
          getTotalElectricityConsumption(startOfMonth, now),
          getTotalWaterConsumption(startOfMonth, now),
          getTotalCarbonEmissions(startOfMonth, now),
          getCarbonEmissionsByType(startOfMonth, now),
          getAllPowerDevices()
        ]);
        
        const report: CarbonEmissionReport = {
          period: input.period || new Date().toISOString().slice(0, 7),
          scope1: carbonByType.scope1 || 0,
          scope2: carbonByType.scope2 || 0,
          scope3: carbonByType.scope3 || 0,
          total: carbonTotal,
          electricityUsage: electricityTotal,
          waterUsage: waterTotal,
          deviceCount: devices.length,
          activeDevices: devices.filter(d => d.status === 'on').length
        };
        
        const exportData = generateCarbonEmissionReportData(report);
        
        if (input.format === 'csv') {
          const csv = exportToCSV(exportData);
          return {
            data: Buffer.from(csv).toString('base64'),
            filename: `carbon_report_${report.period}.csv`,
            mimeType: 'text/csv'
          };
        } else {
          const excel = exportToExcel(exportData);
          return {
            data: excel.toString('base64'),
            filename: `carbon_report_${report.period}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    deviceEnergy: publicProcedure
      .input(z.object({
        format: z.enum(['csv', 'excel'])
      }))
      .mutation(async ({ input }) => {
        const { getAllPowerDevices } = await import('./db');
        const devices = await getAllPowerDevices();
        
        const deviceData: DeviceEnergyData[] = devices.map(device => ({
          deviceName: device.deviceName,
          deviceType: device.deviceType,
          location: device.location || '未設置',
          power: device.powerRating || 0,
          status: device.status,
          totalEnergy: (device.powerRating || 0) * 24 * 30 / 1000,
          carbonEmission: (device.powerRating || 0) * 24 * 30 / 1000 * 0.554
        }));
        
        const exportData = generateDeviceEnergyReportData(deviceData);
        
        if (input.format === 'csv') {
          const csv = exportToCSV(exportData);
          return {
            data: Buffer.from(csv).toString('base64'),
            filename: `device_energy_${new Date().toISOString().slice(0, 10)}.csv`,
            mimeType: 'text/csv'
          };
        } else {
          const excel = exportToExcel(exportData);
          return {
            data: excel.toString('base64'),
            filename: `device_energy_${new Date().toISOString().slice(0, 10)}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    comprehensive: publicProcedure
      .input(z.object({
        period: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { getTotalElectricityConsumption, getTotalWaterConsumption, getTotalCarbonEmissions, getCarbonEmissionsByType, getAllPowerDevices } = await import('./db');
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const [electricityTotal, waterTotal, carbonTotal, carbonByType, devices] = await Promise.all([
          getTotalElectricityConsumption(startOfMonth, now),
          getTotalWaterConsumption(startOfMonth, now),
          getTotalCarbonEmissions(startOfMonth, now),
          getCarbonEmissionsByType(startOfMonth, now),
          getAllPowerDevices()
        ]);
        
        // Mock MQTT analytics data
        const analytics = {
          totalMessages: 15234,
          avgLatency: 23,
          activeTopics: 6
        };
        
        const carbonReport: CarbonEmissionReport = {
          period: input.period || new Date().toISOString().slice(0, 7),
          scope1: carbonByType.scope1 || 0,
          scope2: carbonByType.scope2 || 0,
          scope3: carbonByType.scope3 || 0,
          total: carbonTotal,
          electricityUsage: electricityTotal,
          waterUsage: waterTotal,
          deviceCount: devices.length,
          activeDevices: devices.filter(d => d.status === 'on').length
        };
        
        const deviceData: DeviceEnergyData[] = devices.map(device => ({
          deviceName: device.deviceName,
          deviceType: device.deviceType,
          location: device.location || '未設置',
          power: device.powerRating || 0,
          status: device.status,
          totalEnergy: (device.powerRating || 0) * 24 * 30 / 1000,
          carbonEmission: (device.powerRating || 0) * 24 * 30 / 1000 * 0.554
        }));
        
        const mqttStats: MqttMessageStats[] = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().slice(0, 10),
            totalMessages: Math.floor(analytics.totalMessages / 7),
            avgLatency: analytics.avgLatency,
            activeTopics: analytics.activeTopics,
            errorCount: Math.floor(Math.random() * 10)
          };
        }).reverse();
        
        const exportDataArray = generateComprehensiveReport(carbonReport, deviceData, mqttStats);
        const excel = exportToExcel(exportDataArray);
        
        return {
          data: excel.toString('base64'),
          filename: `comprehensive_report_${carbonReport.period}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      })
  }),
});

export type AppRouter = typeof appRouter;
