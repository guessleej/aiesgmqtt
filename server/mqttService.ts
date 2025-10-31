import mqtt from 'mqtt';
import { getDb } from './db';
import { powerDevices } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

let mqttClient: mqtt.MqttClient | null = null;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

export interface PowerDeviceMessage {
  deviceId: string;
  status: 'on' | 'off';
  timestamp: string;
}

export function getMqttClient(): mqtt.MqttClient {
  if (!mqttClient) {
    mqttClient = mqtt.connect(MQTT_BROKER_URL, {
      clientId: `carbon_system_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    mqttClient.on('connect', () => {
      console.log('[MQTT] Connected to broker:', MQTT_BROKER_URL);
      subscribeToDeviceTopics();
    });

    mqttClient.on('error', (error) => {
      console.error('[MQTT] Connection error:', error);
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString()) as PowerDeviceMessage;
        await handleDeviceMessage(topic, payload);
      } catch (error) {
        console.error('[MQTT] Message parsing error:', error);
      }
    });

    mqttClient.on('close', () => {
      console.log('[MQTT] Connection closed');
    });
  }

  return mqttClient;
}

async function subscribeToDeviceTopics() {
  try {
    const db = await getDb();
    if (!db) return;

    const devices = await db.select().from(powerDevices);
    
    for (const device of devices) {
      if (device.mqttTopic) {
        mqttClient?.subscribe(device.mqttTopic, (err) => {
          if (err) {
            console.error(`[MQTT] Failed to subscribe to ${device.mqttTopic}:`, err);
          } else {
            console.log(`[MQTT] Subscribed to ${device.mqttTopic}`);
          }
        });
      }
    }
  } catch (error) {
    console.error('[MQTT] Failed to subscribe to device topics:', error);
  }
}

async function handleDeviceMessage(topic: string, payload: PowerDeviceMessage) {
  try {
    const db = await getDb();
    if (!db) return;

    // Update device status in database
    await db
      .update(powerDevices)
      .set({
        status: payload.status,
        updatedAt: new Date(),
      })
      .where(eq(powerDevices.deviceId, payload.deviceId));

    console.log(`[MQTT] Device ${payload.deviceId} status updated to ${payload.status}`);
  } catch (error) {
    console.error('[MQTT] Failed to handle device message:', error);
  }
}

export async function publishDeviceCommand(deviceId: string, command: 'on' | 'off'): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const device = await db
      .select()
      .from(powerDevices)
      .where(eq(powerDevices.deviceId, deviceId))
      .limit(1);

    if (device.length === 0) {
      console.error(`[MQTT] Device ${deviceId} not found`);
      return false;
    }

    const topic = device[0].mqttTopic;
    const message = JSON.stringify({
      deviceId,
      command,
      timestamp: new Date().toISOString(),
    });

    const client = getMqttClient();
    
    return new Promise((resolve) => {
      client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to publish command to ${topic}:`, err);
          resolve(false);
        } else {
          console.log(`[MQTT] Command ${command} sent to device ${deviceId}`);
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('[MQTT] Failed to publish device command:', error);
    return false;
  }
}

export function closeMqttConnection() {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
    console.log('[MQTT] Connection closed gracefully');
  }
}

// Initialize MQTT connection on module load
getMqttClient();
