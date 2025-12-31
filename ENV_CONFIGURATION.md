# 環境變量配置指南

本文檔說明AI碳盤查系統所需的環境變量配置。

## 配置方式

### Docker 部署
在 `docker-compose.yml` 中已預設所有必要的環境變量。如需自定義，可以：
1. 直接修改 `docker-compose.yml` 中的 `environment` 部分
2. 創建 `docker-compose.override.yml` 覆蓋配置（推薦）

### 本地開發
系統使用 Manus 平台的內建環境變量管理。所有配置已自動注入，無需手動設置。

## 環境變量列表

### 數據庫配置

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `DATABASE_URL` | MySQL連接字符串 | `mysql://用戶:密碼@主機:端口/數據庫` | ✅ |
| `MYSQL_ROOT_PASSWORD` | MySQL root密碼 | - | ✅ (Docker) |
| `MYSQL_DATABASE` | 數據庫名稱 | `ai_carbon_inventory` | ✅ (Docker) |
| `MYSQL_USER` | 應用數據庫用戶 | `carbon_user` | ✅ (Docker) |
| `MYSQL_PASSWORD` | 應用數據庫密碼 | - | ✅ (Docker) |

**示例**：
```env
DATABASE_URL=mysql://carbon_user:your_password@mysql:3306/ai_carbon_inventory
```

### MQTT配置

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `MQTT_HOST` | MQTT Broker主機 | `mqtt` (Docker) / `localhost` (本地) | ✅ |
| `MQTT_PORT` | MQTT標準協議端口 | `1883` | ✅ |
| `MQTT_WS_PORT` | MQTT WebSocket端口 | `9001` | ❌ |

### 應用配置

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `NODE_ENV` | 運行環境 | `production` | ✅ |
| `APP_PORT` | 應用服務端口 | `3000` | ✅ |
| `JWT_SECRET` | JWT簽名密鑰 | - | ✅ |

**安全提示**：
- `JWT_SECRET` 應使用強隨機字符串
- 生成方式：`openssl rand -base64 32`

### 前端配置

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `VITE_APP_TITLE` | 應用標題 | `AI碳盤查系統` | ✅ |
| `VITE_APP_ID` | 應用ID | `aiesgmqtt` | ✅ |
| `VITE_APP_LOGO` | Logo URL | `/logo.svg` | ❌ |

### 管理員配置

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `OWNER_OPEN_ID` | 管理員OpenID | `admin` | ✅ |
| `OWNER_NAME` | 管理員名稱 | `系統管理員` | ✅ |

### OAuth認證（可選）

| 變量名 | 說明 | 默認值 | 必需 |
|--------|------|--------|------|
| `OAUTH_SERVER_URL` | OAuth服務器URL | `https://api.manus.im` | ❌ |
| `VITE_OAUTH_PORTAL_URL` | OAuth登入入口 | `https://portal.manus.im` | ❌ |

### 第三方服務（可選）

| 變量名 | 說明 | 必需 |
|--------|------|------|
| `BUILT_IN_FORGE_API_URL` | Manus Forge API URL | ❌ |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API Key | ❌ |
| `VITE_FRONTEND_FORGE_API_URL` | 前端Forge API URL | ❌ |
| `VITE_FRONTEND_FORGE_API_KEY` | 前端Forge API Key | ❌ |

### 分析與監控（可選）

| 變量名 | 說明 | 必需 |
|--------|------|------|
| `VITE_ANALYTICS_ENDPOINT` | 分析服務端點 | ❌ |
| `VITE_ANALYTICS_WEBSITE_ID` | 網站分析ID | ❌ |

## Docker Compose 配置示例

### 基本配置

```yaml
version: '3.8'

services:
  app:
    environment:
      - DATABASE_URL=mysql://carbon_user:secure_password@mysql:3306/ai_carbon_inventory
      - JWT_SECRET=your_random_jwt_secret_here
      - NODE_ENV=production
      - MQTT_HOST=mqtt
      - MQTT_PORT=1883
```

### 使用 docker-compose.override.yml

創建 `docker-compose.override.yml` 文件來覆蓋默認配置：

```yaml
version: '3.8'

services:
  mysql:
    environment:
      - MYSQL_ROOT_PASSWORD=my_custom_root_password
      - MYSQL_PASSWORD=my_custom_app_password
  
  app:
    environment:
      - DATABASE_URL=mysql://carbon_user:my_custom_app_password@mysql:3306/ai_carbon_inventory
      - JWT_SECRET=my_custom_jwt_secret
      - VITE_APP_TITLE=我的碳盤查系統
    ports:
      - "8080:3000"  # 自定義端口映射
```

## 本地開發配置

在 Manus 開發環境中，大部分環境變量已自動配置。如需修改：

1. 訪問項目的 Settings → Secrets 面板
2. 添加或修改所需的環境變量
3. 重啟開發服務器使更改生效

## 生產環境最佳實踐

### 1. 密碼安全
- ✅ 使用強隨機密碼（至少16字符）
- ✅ 定期更換敏感憑證
- ❌ 切勿使用默認密碼
- ❌ 切勿將密碼提交到版本控制

### 2. 密鑰管理
```bash
# 生成強隨機JWT密鑰
openssl rand -base64 32

# 生成MySQL密碼
openssl rand -base64 24
```

### 3. 環境隔離
- 開發環境使用 `.env.development`
- 測試環境使用 `.env.test`
- 生產環境使用 `.env.production`
- 使用環境變量管理工具（如 HashiCorp Vault）

### 4. 最小權限原則
- 應用數據庫用戶只授予必要權限
- 避免使用 root 用戶運行應用
- 限制 MQTT 客戶端訪問權限

## 故障排除

### 數據庫連接失敗
```bash
# 檢查DATABASE_URL格式
echo $DATABASE_URL

# 測試MySQL連接
mysql -h mysql -u carbon_user -p ai_carbon_inventory

# Docker環境檢查服務狀態
docker compose ps
docker compose logs mysql
```

### MQTT連接失敗
```bash
# 測試MQTT連接
mosquitto_sub -h mqtt -p 1883 -t test/topic

# 檢查MQTT服務
docker compose logs mqtt

# 驗證端口開放
netstat -an | grep 1883
```

### 環境變量未生效
```bash
# 檢查環境變量是否正確加載
docker compose config

# 重新構建並啟動
docker compose down
docker compose up --build -d
```

## 參考資源

- [Docker Compose 環境變量文檔](https://docs.docker.com/compose/environment-variables/)
- [Node.js 環境變量最佳實踐](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [MySQL 安全配置指南](https://dev.mysql.com/doc/refman/8.0/en/security.html)
- [MQTT 安全配置](https://mosquitto.org/man/mosquitto-conf-5.html)
