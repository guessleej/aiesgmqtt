# AI碳盤查系統 (aiesgmqtt)

## AI Carbon Inventory System

即時監控與智能管理系統，整合MQTT設備控制、環境監測、碳排放分析與AI預測。

---

## 功能特色

### 環境監控儀表板 (Dashboard)

- 即時用電量監控（kWh）
- 用水量統計與趨勢分析
- 空氣質量監測（CO₂濃度、溫度、濕度）
- 碳排放分類統計（Scope 1/2/3）
- 設備運行狀態總覽
- 自動數據更新（每3秒）

### 設備管理中心 (Device Management)

- 電源設備遠程控制（MQTT協議）
- 設備狀態即時監控（運行中/已關閉/離線）
- 設備功率與能耗統計
- 一鍵開關控制功能
- 設備分類管理

### MQTT數據分析 (MQTT Analytics)

- 24小時消息流量統計
- 設備通訊狀態分析
- 消息排行榜與趨勢圖
- 實時消息監控
- 平均延遲分析

---

## 技術架構

| 類別 | 技術 |
| --- | --- |
| 前端框架 | React 19 + TypeScript + Vite |
| UI 元件 | Tailwind CSS 4 + Lucide Icons |
| 後端框架 | Express 4 + tRPC 11 |
| 資料庫 | MySQL 8.0 + Drizzle ORM |
| 通訊協議 | MQTT (Mosquitto Broker) |
| 容器化 | Docker + Docker Compose |
| 圖表 | Recharts |
| 狀態管理 | React Query (via tRPC) |

---

## 快速開始

### 方法一：Docker部署（推薦）

```bash
# 1. 克隆儲存庫
git clone https://github.com/guessleej/aiesgmqtt.git
cd aiesgmqtt

# 2. 一鍵啟動
./start.sh
```

系統將自動啟動：
- Web應用（端口 3000）
- MySQL數據庫（端口 3306）
- MQTT Broker（端口 1883/9001）

訪問：http://localhost:3000

### 方法二：本地開發

```bash
# 安裝依賴
pnpm install

# 配置環境變量
cp env.example .env
# 編輯 .env 文件設置數據庫連接

# 推送數據庫架構
pnpm db:push

# 填充測試數據（可選）
npx tsx scripts/seedData.ts

# 啟動開發服務器
pnpm dev
```

---

## 環境變數

```env
# 數據庫配置
DATABASE_URL=mysql://jefflee:123456-s@localhost:3306/ai_carbon_inventory

# JWT密鑰
JWT_SECRET=your_jwt_secret_key

# OAuth配置
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# 應用配置
VITE_APP_TITLE=AI碳盤查系統
VITE_APP_LOGO=/logo.svg
```

完整配置請參考 `env.example` 文件。

---

## Docker部署

### 服務組成

- **app**: 前後端整合應用（Node.js + Express + React）
- **mysql**: MySQL 8.0 數據庫
- **mqtt**: Mosquitto MQTT Broker

### 常用命令

```bash
# 啟動所有服務
docker compose up -d

# 查看服務狀態
docker compose ps

# 查看日誌
docker compose logs -f

# 停止服務
docker compose stop

# 完全移除（包括數據）
docker compose down -v
```

詳細部署文檔請參考：
- [Docker快速指南](./README_DOCKER.md)
- [詳細部署文檔](./DOCKER_DEPLOYMENT.md)

---

## 項目結構

```
aiesgmqtt/
├── client/                    # React前端應用
│   ├── src/
│   │   ├── pages/            # 頁面組件
│   │   │   ├── Dashboard.tsx      # 環境監控儀表板
│   │   │   ├── DeviceManagement.tsx  # 設備管理
│   │   │   └── MqttAnalytics.tsx  # MQTT分析
│   │   ├── components/       # 可重用組件
│   │   │   └── Navigation.tsx     # 導航欄
│   │   └── lib/              # 工具庫
│   │       └── trpc.ts           # tRPC客戶端
│   └── index.html
├── server/                    # Express後端
│   ├── routers.ts            # tRPC路由定義
│   ├── db.ts                 # 數據庫操作
│   └── mqttService.ts        # MQTT服務管理
├── drizzle/                   # 數據庫架構
│   └── schema.ts             # 表結構定義
├── mosquitto/                 # MQTT配置
│   └── config/
│       └── mosquitto.conf    # Mosquitto配置
├── scripts/                   # 工具腳本
│   └── seedData.ts           # 測試數據生成
├── Dockerfile                 # Docker鏡像配置
├── docker-compose.yml         # Docker編排配置
├── start.sh                   # 快速啟動腳本
├── env.example                # 環境變量示例
└── README.md                  # 本文件
```

---

## 數據庫架構

系統包含以下主要數據表：

- **users**: 用戶認證與授權
- **power_devices**: 電源設備管理
- **electricity_records**: 用電記錄
- **water_usage**: 用水記錄
- **air_quality**: 空氣質量監測
- **carbon_emissions**: 碳排放記錄

完整架構請參考 `drizzle/schema.ts`

---

## MQTT主題結構

```
devices/{device_id}/status      # 設備狀態
devices/{device_id}/control     # 設備控制
devices/{device_id}/power       # 功率數據
sensors/{sensor_id}/data        # 傳感器數據
```

---

## API端點

系統使用tRPC提供類型安全的API：

### Dashboard相關
- `dashboard.getData`: 獲取儀表板數據

### 設備管理
- `devices.list`: 獲取設備列表
- `devices.toggle`: 切換設備狀態
- `devices.getStatus`: 獲取設備狀態

### MQTT分析
- `mqtt.getAnalytics`: 獲取MQTT分析數據
- `mqtt.getMessages`: 獲取實時消息

完整API文檔請參考 `server/routers.ts`

---

## 開發指南

### 添加新頁面

1. 在 `client/src/pages/` 創建新組件
2. 在 `client/src/App.tsx` 添加路由
3. 在 `client/src/components/Navigation.tsx` 添加導航鏈接

### 添加新API

1. 在 `server/db.ts` 添加數據庫查詢函數
2. 在 `server/routers.ts` 添加tRPC路由
3. 在前端使用 `trpc.*.useQuery()` 或 `trpc.*.useMutation()` 調用

### 數據庫遷移

```bash
# 修改 drizzle/schema.ts 後執行
pnpm db:push
```

---

## 系統要求

- Node.js 22+
- pnpm 9+
- MySQL 8.0+
- Docker 20.10+ (Docker部署)
- Docker Compose 2.0+ (Docker部署)

---

## 瀏覽器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 授權

MIT License

---

## 貢獻指南

歡迎提交Issue和Pull Request！

1. Fork本儲存庫
2. 創建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟Pull Request

---

## 聯絡資訊

如有任何問題或建議，歡迎提出 [Issue](https://github.com/guessleej/aiesgmqtt/issues)。

---

## 相關文檔

- [Docker部署指南](./README_DOCKER.md)
- [詳細部署文檔](./DOCKER_DEPLOYMENT.md)
- [GitHub推送指南](./PUSH_TO_GITHUB.md)
- [項目待辦事項](./todo.md)

---

## About

AI碳盤查系統 - 整合MQTT、環境監控和設備管理的智能碳排放管理平台

**Keywords**: IoT, MQTT, Carbon Emissions, Environmental Monitoring, Device Management, AI Analytics
