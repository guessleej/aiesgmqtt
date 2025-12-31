import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';

/**
 * 數據導出服務
 * 提供CSV和Excel格式的數據導出功能
 */

export interface ExportData {
  headers: string[];
  rows: any[][];
  sheetName?: string;
}

export interface CarbonEmissionReport {
  period: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  electricityUsage: number;
  waterUsage: number;
  deviceCount: number;
  activeDevices: number;
}

/**
 * 導出為CSV格式
 */
export function exportToCSV(data: ExportData): string {
  const { headers, rows } = data;
  
  // 將數據轉換為對象數組
  const records = rows.map(row => {
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });
  
  // 使用json2csv轉換
  const parser = new Parser({ fields: headers });
  const csv = parser.parse(records);
  
  return csv;
}

/**
 * 導出為Excel格式
 */
export function exportToExcel(data: ExportData | ExportData[]): Buffer {
  const workbook = XLSX.utils.book_new();
  
  // 支持單個或多個工作表
  const sheets = Array.isArray(data) ? data : [data];
  
  sheets.forEach((sheetData, index) => {
    const { headers, rows, sheetName } = sheetData;
    
    // 創建工作表數據（包含標題行）
    const wsData = [headers, ...rows];
    
    // 創建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // 設置列寬
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    const name = sheetName || `Sheet${index + 1}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });
  
  // 生成Excel文件
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer as Buffer;
}

/**
 * 生成碳排放報告數據
 */
export function generateCarbonEmissionReportData(
  report: CarbonEmissionReport
): ExportData {
  const headers = [
    '報告期間',
    'Scope 1 排放 (kg CO₂e)',
    'Scope 2 排放 (kg CO₂e)',
    'Scope 3 排放 (kg CO₂e)',
    '總排放量 (kg CO₂e)',
    '用電量 (kWh)',
    '用水量 (L)',
    '設備總數',
    '運行設備數'
  ];
  
  const rows = [[
    report.period,
    report.scope1.toFixed(2),
    report.scope2.toFixed(2),
    report.scope3.toFixed(2),
    report.total.toFixed(2),
    report.electricityUsage.toFixed(2),
    report.waterUsage.toFixed(2),
    report.deviceCount.toString(),
    report.activeDevices.toString()
  ]];
  
  return {
    headers,
    rows,
    sheetName: '碳排放報告'
  };
}

/**
 * 生成設備能耗報告數據
 */
export interface DeviceEnergyData {
  deviceName: string;
  deviceType: string;
  location: string;
  power: number;
  status: string;
  totalEnergy: number;
  carbonEmission: number;
}

export function generateDeviceEnergyReportData(
  devices: DeviceEnergyData[]
): ExportData {
  const headers = [
    '設備名稱',
    '設備類型',
    '位置',
    '額定功率 (W)',
    '狀態',
    '總能耗 (kWh)',
    '碳排放 (kg CO₂e)'
  ];
  
  const rows = devices.map(device => [
    device.deviceName,
    device.deviceType,
    device.location,
    device.power.toString(),
    device.status,
    device.totalEnergy.toFixed(2),
    device.carbonEmission.toFixed(2)
  ]);
  
  return {
    headers,
    rows,
    sheetName: '設備能耗報告'
  };
}

/**
 * 生成MQTT消息統計報告數據
 */
export interface MqttMessageStats {
  date: string;
  totalMessages: number;
  avgLatency: number;
  activeTopics: number;
  errorCount: number;
}

export function generateMqttStatsReportData(
  stats: MqttMessageStats[]
): ExportData {
  const headers = [
    '日期',
    '總消息數',
    '平均延遲 (ms)',
    '活躍主題數',
    '錯誤數'
  ];
  
  const rows = stats.map(stat => [
    stat.date,
    stat.totalMessages.toString(),
    stat.avgLatency.toFixed(2),
    stat.activeTopics.toString(),
    stat.errorCount.toString()
  ]);
  
  return {
    headers,
    rows,
    sheetName: 'MQTT統計報告'
  };
}

/**
 * 生成綜合報告（多個工作表）
 */
export function generateComprehensiveReport(
  carbonReport: CarbonEmissionReport,
  devices: DeviceEnergyData[],
  mqttStats: MqttMessageStats[]
): ExportData[] {
  return [
    generateCarbonEmissionReportData(carbonReport),
    generateDeviceEnergyReportData(devices),
    generateMqttStatsReportData(mqttStats)
  ];
}
