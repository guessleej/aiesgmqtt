import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
});

export type AppRouter = typeof appRouter;
