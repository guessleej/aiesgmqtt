# AI碳盤查系統 - Docker部署指南

本文檔說明如何使用Docker在任何環境中部署完整的AI碳盤查系統。

## 系統架構

Docker部署包含以下容器：
- **MySQL 8.0**: 數據庫服務
- **Eclipse Mosquitto 2**: MQTT消息代理
- **Node.js應用**: 前後端整合服務

## 前置需求

確保您的系統已安裝：
- Docker Engine 20.10+
- Docker Compose 2.0+

### 安裝Docker (Ubuntu/Debian)

```bash
# 更新套件列表
sudo apt update

# 安裝Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安裝Docker Compose
sudo apt install docker-compose-plugin

# 驗證安裝
docker --version
docker compose version
```

## 快速開始

### 1. 克隆或複製項目

```bash
# 如果從Git倉庫
git clone <repository-url>
cd enhanced_carbon_system

# 或直接使用項目目錄
cd /path/to/enhanced_carbon_system
```

### 2. 配置環境變量

```bash
# 複製環境變量示例文件
cp env.example .env

# 編輯.env文件，修改敏感信息
nano .env
```

**重要**: 請務必修改以下變量：
- `MYSQL_ROOT_PASSWORD`: MySQL root密碼
- `MYSQL_PASSWORD`: 應用數據庫用戶密碼
- `JWT_SECRET`: JWT加密密鑰（至少32字符）

### 3. 啟動服務

```bash
# 構建並啟動所有容器
docker compose up -d

# 查看容器狀態
docker compose ps

# 查看日誌
docker compose logs -f
```

### 4. 初始化數據庫

```bash
# 等待MySQL容器完全啟動（約30秒）
sleep 30

# 執行數據庫遷移
docker compose exec app pnpm db:push

# （可選）填充測試數據
docker compose exec app npx tsx scripts/seedData.ts
```

### 5. 訪問應用

打開瀏覽器訪問：
- **應用界面**: http://localhost:3000
- **健康檢查**: http://localhost:3000/api/health

## 服務端口

| 服務 | 端口 | 說明 |
|------|------|------|
| 應用服務 | 3000 | Web界面和API |
| MySQL | 3306 | 數據庫服務 |
| MQTT | 1883 | MQTT協議 |
| MQTT WebSocket | 9001 | WebSocket協議 |

## 常用命令

### 容器管理

```bash
# 啟動服務
docker compose up -d

# 停止服務
docker compose stop

# 重啟服務
docker compose restart

# 停止並刪除容器
docker compose down

# 停止並刪除容器和數據卷（警告：會刪除所有數據）
docker compose down -v
```

### 查看日誌

```bash
# 查看所有服務日誌
docker compose logs -f

# 查看特定服務日誌
docker compose logs -f app
docker compose logs -f mysql
docker compose logs -f mqtt
```

### 進入容器

```bash
# 進入應用容器
docker compose exec app sh

# 進入MySQL容器
docker compose exec mysql bash

# 進入MQTT容器
docker compose exec mqtt sh
```

### 數據庫操作

```bash
# 連接到MySQL
docker compose exec mysql mysql -u carbon_user -p ai_carbon_inventory

# 備份數據庫
docker compose exec mysql mysqldump -u carbon_user -p ai_carbon_inventory > backup.sql

# 恢復數據庫
docker compose exec -T mysql mysql -u carbon_user -p ai_carbon_inventory < backup.sql
```

## 生產環境部署建議

### 1. 安全設置

- 修改所有默認密碼
- 使用強密碼（至少16字符，包含大小寫字母、數字和特殊字符）
- 限制數據庫和MQTT端口只在內部網絡訪問
- 啟用MQTT認證（修改mosquitto.conf）

### 2. 反向代理

建議使用Nginx或Traefik作為反向代理：

```nginx
# Nginx配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL/TLS配置

使用Let's Encrypt獲取免費SSL證書：

```bash
# 安裝Certbot
sudo apt install certbot python3-certbot-nginx

# 獲取證書
sudo certbot --nginx -d your-domain.com
```

### 4. 數據持久化

確保定期備份Docker數據卷：

```bash
# 創建備份腳本
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 備份MySQL數據
docker compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases > $BACKUP_DIR/mysql_backup.sql

# 備份MQTT數據
docker compose exec mqtt tar czf - /mosquitto/data > $BACKUP_DIR/mqtt_data.tar.gz
```

### 5. 監控和日誌

```bash
# 配置日誌輪轉
# 在docker-compose.yml中添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 故障排除

### 容器無法啟動

```bash
# 檢查容器狀態
docker compose ps

# 查看詳細日誌
docker compose logs

# 重新構建容器
docker compose build --no-cache
docker compose up -d
```

### 數據庫連接失敗

```bash
# 檢查MySQL容器狀態
docker compose exec mysql mysqladmin -u root -p ping

# 檢查數據庫用戶權限
docker compose exec mysql mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
```

### MQTT連接問題

```bash
# 測試MQTT連接
docker compose exec mqtt mosquitto_sub -h localhost -t test/topic -v

# 在另一個終端發布消息
docker compose exec mqtt mosquitto_pub -h localhost -t test/topic -m "test message"
```

### 端口衝突

如果端口已被占用，修改docker-compose.yml中的端口映射：

```yaml
ports:
  - "8080:3000"  # 將3000改為8080
```

## 更新應用

```bash
# 拉取最新代碼
git pull

# 重新構建並啟動
docker compose build
docker compose up -d

# 執行數據庫遷移
docker compose exec app pnpm db:push
```

## 性能優化

### 1. 資源限制

在docker-compose.yml中添加資源限制：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. 數據庫優化

```bash
# 優化MySQL配置
docker compose exec mysql mysql -u root -p -e "
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 1G;
"
```

## 卸載

完全移除系統和所有數據：

```bash
# 停止並刪除容器、網絡和數據卷
docker compose down -v

# 刪除鏡像
docker rmi enhanced_carbon_system-app
docker rmi mysql:8.0
docker rmi eclipse-mosquitto:2
```

## 技術支持

如遇問題，請檢查：
1. Docker和Docker Compose版本是否符合要求
2. 系統資源是否充足（至少4GB RAM）
3. 端口是否被其他服務占用
4. 環境變量配置是否正確

## 許可證

本項目遵循MIT許可證。
