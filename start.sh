#!/bin/bash

echo "🚀 啟動AI碳盤查系統..."

# 檢查Docker是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安裝，請先安裝Docker"
    exit 1
fi

# 檢查Docker Compose是否安裝
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安裝，請先安裝Docker Compose"
    exit 1
fi

# 檢查環境變量文件是否存在
if [ ! -f .env ]; then
    echo "📝 創建環境變量文件..."
    cp env.example .env
    echo "⚠️  請編輯.env文件並設置您的配置"
    echo "   特別是修改密碼和密鑰！"
    read -p "按Enter繼續..."
fi

# 啟動服務
echo "🐳 啟動Docker容器..."
docker compose up -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
docker compose ps

# 等待MySQL完全啟動
echo "⏳ 等待MySQL啟動..."
sleep 20

# 執行數據庫遷移
echo "🗄️  執行數據庫遷移..."
docker compose exec -T app pnpm db:push

echo ""
echo "✅ 系統啟動完成！"
echo ""
echo "📱 訪問地址:"
echo "   應用界面: http://localhost:3000"
echo "   健康檢查: http://localhost:3000/api/health"
echo ""
echo "📝 查看日誌:"
echo "   docker compose logs -f"
echo ""
echo "🛑 停止服務:"
echo "   docker compose stop"
echo ""
