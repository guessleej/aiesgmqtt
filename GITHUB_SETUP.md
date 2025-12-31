# GitHub儲存庫設置指南

本文檔說明如何將AI碳盤查系統推送到GitHub儲存庫。

## 方法一：在GitHub網站創建儲存庫（推薦）

### 步驟1：創建儲存庫

1. 訪問 GitHub: https://github.com/new
2. 填寫以下信息：
   - **Repository name**: `aiesgmqtt`
   - **Description**: `AI碳盤查系統 - 整合MQTT、環境監控和設備管理的智能碳排放管理平台`
   - **Visibility**: Public（或選擇Private如果需要私有）
   - **重要**: 不要勾選 "Initialize this repository with a README"
3. 點擊 "Create repository"

### 步驟2：推送代碼

在創建儲存庫後，在項目目錄執行以下命令：

```bash
cd /home/ubuntu/enhanced_carbon_system

# 設置遠程儲存庫（替換 YOUR_USERNAME 為您的GitHub用戶名）
git remote add github https://github.com/YOUR_USERNAME/aiesgmqtt.git

# 推送代碼到GitHub
git push -u github main
```

如果遠程已存在，使用：
```bash
git remote set-url github https://github.com/YOUR_USERNAME/aiesgmqtt.git
git push -u github main
```

## 方法二：使用GitHub CLI（需要正確的權限）

如果您的GitHub token有足夠權限，可以使用：

```bash
cd /home/ubuntu/enhanced_carbon_system

# 創建儲存庫並推送
gh repo create aiesgmqtt --public \
  --description "AI碳盤查系統 - 整合MQTT、環境監控和設備管理的智能碳排放管理平台" \
  --source=. \
  --remote=github \
  --push
```

## 驗證推送

推送成功後，訪問您的儲存庫：
```
https://github.com/YOUR_USERNAME/aiesgmqtt
```

您應該能看到所有項目文件，包括：
- Dockerfile
- docker-compose.yml
- 前端和後端代碼
- 文檔（README_DOCKER.md, DOCKER_DEPLOYMENT.md等）

## 克隆儲存庫

其他人可以使用以下命令克隆您的儲存庫：

```bash
git clone https://github.com/YOUR_USERNAME/aiesgmqtt.git
cd aiesgmqtt
```

## 更新代碼

當您對項目做出更改後，使用以下命令推送更新：

```bash
cd /home/ubuntu/enhanced_carbon_system

# 添加更改
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到GitHub
git push github main
```

## 故障排除

### 權限錯誤

如果遇到權限錯誤，確保：
1. GitHub token有 `repo` 權限
2. Token沒有過期
3. 使用正確的儲存庫URL

### 推送失敗

如果推送失敗，嘗試：
```bash
# 強制推送（謹慎使用）
git push -f github main
```

### 查看當前遠程設置

```bash
git remote -v
```

## 項目結構

推送到GitHub的項目包含：

```
aiesgmqtt/
├── client/              # React前端
├── server/              # Express後端
├── drizzle/             # 數據庫架構
├── mosquitto/           # MQTT配置
├── Dockerfile           # Docker鏡像配置
├── docker-compose.yml   # Docker編排
├── start.sh            # 快速啟動腳本
├── env.example         # 環境變量示例
├── README_DOCKER.md    # Docker快速指南
├── DOCKER_DEPLOYMENT.md # 詳細部署文檔
└── todo.md             # 項目待辦事項
```

## 下一步

推送到GitHub後，您可以：
1. 添加README.md主文檔
2. 設置GitHub Actions進行CI/CD
3. 添加Issue模板
4. 配置GitHub Pages（如果需要）
5. 邀請協作者

## 許可證

建議添加LICENSE文件。常用選項：
- MIT License（最寬鬆）
- Apache License 2.0
- GPL v3（開源）

在GitHub儲存庫頁面可以輕鬆添加許可證文件。
