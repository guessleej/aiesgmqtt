# 推送代碼到GitHub完整指南

## 當前狀態

✅ GitHub儲存庫已創建：https://github.com/guessleej/aiesgmqtt
✅ 項目備份已打包：`/home/ubuntu/aiesgmqtt-backup.tar.gz`
⏳ 等待推送代碼到GitHub

## 方法一：使用備份壓縮包（推薦）

### 步驟1：下載備份壓縮包

備份文件位置：`/home/ubuntu/aiesgmqtt-backup.tar.gz`

您可以通過以下方式下載：
- 如果在本地環境，直接複製文件
- 如果在遠程服務器，使用 `scp` 或 `sftp` 下載

### 步驟2：在本地解壓並推送

```bash
# 解壓縮
tar -xzf aiesgmqtt-backup.tar.gz
cd enhanced_carbon_system

# 初始化Git（如果需要）
git init

# 添加遠程儲存庫
git remote add origin https://github.com/guessleej/aiesgmqtt.git

# 添加所有文件
git add -A

# 提交
git commit -m "Initial commit: AI碳盤查系統完整版本"

# 推送到GitHub
git push -u origin main
```

如果推送時要求認證，使用您的GitHub用戶名和Personal Access Token作為密碼。

## 方法二：直接從服務器推送

### 檢查Token權限

確保您的GitHub Personal Access Token有以下權限：
- ✅ repo (完整權限)
- ✅ workflow
- ✅ write:packages
- ✅ delete:packages

### 重新生成Token（如果需要）

1. 訪問：https://github.com/settings/tokens
2. 點擊現有token或創建新token
3. 確保勾選所有必要權限
4. 保存並複製新token

### 使用新Token推送

```bash
cd /home/ubuntu/enhanced_carbon_system

# 配置Git使用新token
git remote set-url github https://YOUR_USERNAME:YOUR_NEW_TOKEN@github.com/guessleej/aiesgmqtt.git

# 推送
git push -u github main
```

## 方法三：使用SSH密鑰（最安全）

### 步驟1：生成SSH密鑰

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 步驟2：添加SSH密鑰到GitHub

```bash
# 查看公鑰
cat ~/.ssh/id_ed25519.pub
```

複製輸出，然後：
1. 訪問：https://github.com/settings/keys
2. 點擊 "New SSH key"
3. 粘貼公鑰並保存

### 步驟3：使用SSH推送

```bash
cd /home/ubuntu/enhanced_carbon_system

# 添加SSH遠程
git remote add ssh git@github.com:guessleej/aiesgmqtt.git

# 推送
git push -u ssh main
```

## 驗證推送成功

推送成功後，訪問：
https://github.com/guessleej/aiesgmqtt

您應該能看到：
- ✅ 所有源代碼文件
- ✅ Docker配置文件
- ✅ 文檔文件
- ✅ 最新的提交記錄

## 項目包含的主要文件

```
aiesgmqtt/
├── client/                    # React前端應用
│   ├── src/
│   │   ├── pages/            # 頁面組件
│   │   ├── components/       # 可重用組件
│   │   └── lib/              # 工具庫
│   └── index.html
├── server/                    # Express後端
│   ├── routers.ts            # API路由
│   ├── db.ts                 # 數據庫操作
│   └── mqttService.ts        # MQTT服務
├── drizzle/                   # 數據庫架構
│   └── schema.ts
├── mosquitto/                 # MQTT配置
│   └── config/
│       └── mosquitto.conf
├── scripts/                   # 工具腳本
│   └── seedData.ts           # 測試數據
├── Dockerfile                 # Docker鏡像配置
├── docker-compose.yml         # Docker編排
├── start.sh                   # 快速啟動腳本
├── env.example                # 環境變量示例
├── README_DOCKER.md           # Docker快速指南
├── DOCKER_DEPLOYMENT.md       # 詳細部署文檔
├── GITHUB_SETUP.md            # GitHub設置指南
└── todo.md                    # 項目待辦事項
```

## 後續步驟

推送成功後，建議：

1. **添加主README**
   ```bash
   # 在項目根目錄創建README.md
   cat > README.md << 'EOF'
   # AI碳盤查系統 (aiesgmqtt)
   
   智能碳排放管理平台，整合MQTT、環境監控和設備管理。
   
   ## 快速開始
   
   詳見 [Docker部署指南](./README_DOCKER.md)
   
   ## 功能特色
   
   - 🌍 環境監控儀表板
   - ⚡ 設備電源管理
   - 📊 MQTT數據分析
   - 🐳 Docker一鍵部署
   
   ## 文檔
   
   - [Docker快速開始](./README_DOCKER.md)
   - [詳細部署指南](./DOCKER_DEPLOYMENT.md)
   - [GitHub設置](./GITHUB_SETUP.md)
   EOF
   
   git add README.md
   git commit -m "Add main README"
   git push
   ```

2. **添加LICENSE**
   - 在GitHub網頁上點擊 "Add file" → "Create new file"
   - 文件名輸入 `LICENSE`
   - 選擇許可證模板（推薦MIT）

3. **設置GitHub Pages**（可選）
   - Settings → Pages
   - 選擇分支和目錄
   - 保存

4. **配置GitHub Actions**（可選）
   - 自動化測試
   - 自動化部署
   - 代碼質量檢查

## 故障排除

### 403 Permission Denied

**原因**：Token權限不足或已過期

**解決方案**：
1. 重新生成token，確保有完整的`repo`權限
2. 使用新token更新遠程URL
3. 或使用SSH密鑰代替HTTPS

### 無法推送大文件

**原因**：GitHub單個文件限制100MB

**解決方案**：
1. 檢查`.gitignore`是否正確排除大文件
2. 使用Git LFS處理大文件
3. 將大文件移至外部存儲

### 推送衝突

**原因**：遠程有本地沒有的提交

**解決方案**：
```bash
# 拉取遠程更改
git pull github main --rebase

# 解決衝突後推送
git push github main
```

## 獲取幫助

- GitHub文檔：https://docs.github.com
- Git文檔：https://git-scm.com/doc
- 項目Issues：https://github.com/guessleej/aiesgmqtt/issues

## 聯繫方式

如有問題，請在GitHub儲存庫中創建Issue。
