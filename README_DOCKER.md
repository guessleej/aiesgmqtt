# AI碳盤查系統 - Docker快速部署

這是一個完整的AI碳盤查系統，支持環境監控、設備管理和MQTT數據分析。

## 🚀 快速開始

### 一鍵啟動（推薦）

```bash
./start.sh
```

### 手動啟動

```bash
# 1. 複製環境變量配置
cp env.example .env

# 2. 編輯.env文件，修改密碼和密鑰
nano .env

# 3. 啟動所有服務
docker compose up -d

# 4. 等待30秒後執行數據庫遷移
docker compose exec app pnpm db:push

# 5. （可選）填充測試數據
docker compose exec app npx tsx scripts/seedData.ts
```

## 📦 包含的服務

- **Web應用** (端口 3000): 前後端整合服務
- **MySQL 8.0** (端口 3306): 數據庫
- **MQTT Broker** (端口 1883/9001): 消息代理

## 🌐 訪問地址

- 應用界面: http://localhost:3000
- 健康檢查: http://localhost:3000/api/health
- MQTT: mqtt://localhost:1883
- MQTT WebSocket: ws://localhost:9001

## 📚 功能模組

1. **環境監控儀表板**: 實時顯示用電、用水、空氣質量和碳排放數據
2. **設備管理中心**: 通過MQTT遠程控制電源設備
3. **MQTT數據分析**: 消息流量統計和設備通訊分析

## 🛠️ 常用命令

```bash
# 查看服務狀態
docker compose ps

# 查看日誌
docker compose logs -f

# 停止服務
docker compose stop

# 重啟服務
docker compose restart

# 完全移除（包括數據）
docker compose down -v
```

## 📖 詳細文檔

完整的部署文檔請參考: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## ⚙️ 系統要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 4GB RAM
- 至少 10GB 磁盤空間

## 🔒 安全提示

⚠️ **生產環境部署前請務必**:
1. 修改所有默認密碼
2. 更改JWT_SECRET為強密鑰
3. 配置防火牆規則
4. 啟用SSL/TLS
5. 定期備份數據

## 📞 技術支持

如遇問題，請查看:
- [Docker部署文檔](./DOCKER_DEPLOYMENT.md)
- [故障排除指南](./DOCKER_DEPLOYMENT.md#故障排除)

## 📄 許可證

MIT License
