# GitHub Actions Workflows

本目錄包含AI碳盤查系統的CI/CD自動化工作流程配置。

## 工作流程說明

### 1. CI - Test & Build (`ci.yml`)

**觸發條件**：
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交 Pull Request

**執行內容**：
- 設置 MySQL 測試數據庫
- 安裝項目依賴
- 運行代碼檢查（Linter）
- 運行類型檢查（TypeScript）
- 構建應用程序
- 上傳構建產物

**用途**：確保每次代碼變更都能成功構建並通過基本檢查。

### 2. Docker Build & Push (`docker-build.yml`)

**觸發條件**：
- 推送到 `main` 分支
- 創建版本標籤（`v*`）
- 發布新版本（Release）

**執行內容**：
- 構建 Docker 鏡像
- 推送到 GitHub Container Registry (ghcr.io)
- 支持多平台（amd64, arm64）
- 自動生成版本標籤

**鏡像標籤規則**：
- `latest`: 最新的 main 分支構建
- `main`: main 分支最新提交
- `v1.0.0`: 語義化版本標籤
- `main-abc123`: 分支名-提交SHA

**使用方式**：
```bash
# 拉取最新鏡像
docker pull ghcr.io/guessleej/aiesgmqtt:latest

# 拉取特定版本
docker pull ghcr.io/guessleej/aiesgmqtt:v1.0.0
```

### 3. Code Quality (`code-quality.yml`)

**觸發條件**：
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交 Pull Request

**執行內容**：
- **代碼格式檢查**：使用 Prettier 檢查代碼格式
- **代碼質量檢查**：使用 ESLint 檢查代碼質量
- **安全掃描**：使用 Trivy 掃描安全漏洞
- **依賴審查**：檢查依賴包的安全性（僅 PR）

**用途**：維護代碼質量和安全標準。

## 工作流程狀態徽章

在 README.md 中添加以下徽章來顯示工作流程狀態：

```markdown
![CI Status](https://github.com/guessleej/aiesgmqtt/workflows/CI%20-%20Test%20%26%20Build/badge.svg)
![Docker Build](https://github.com/guessleej/aiesgmqtt/workflows/Docker%20Build%20%26%20Push/badge.svg)
![Code Quality](https://github.com/guessleej/aiesgmqtt/workflows/Code%20Quality/badge.svg)
```

## 配置 Secrets

某些工作流程可能需要配置 GitHub Secrets：

1. 進入儲存庫的 Settings > Secrets and variables > Actions
2. 添加以下 Secrets（如需要）：
   - `DOCKER_USERNAME`: Docker Hub 用戶名（如果推送到 Docker Hub）
   - `DOCKER_PASSWORD`: Docker Hub 密碼或 Token
   - `DEPLOY_KEY`: 部署密鑰（如果需要自動部署）

**注意**：推送到 GitHub Container Registry 使用內建的 `GITHUB_TOKEN`，無需額外配置。

## 本地測試

在推送代碼前，可以在本地運行相同的檢查：

```bash
# 代碼格式檢查
pnpm prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}"

# 代碼質量檢查
pnpm lint

# 類型檢查
pnpm type-check

# 構建測試
pnpm build
```

## 自動部署（可選）

如需添加自動部署功能，可以創建 `deploy.yml` 工作流程：

```yaml
name: Deploy

on:
  workflow_run:
    workflows: ["Docker Build & Push"]
    types:
      - completed
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Deploy to production
        run: |
          # 添加部署腳本
          echo "Deploying to production..."
```

## 故障排除

### 構建失敗

1. 檢查 Actions 標籤頁的詳細日誌
2. 確保所有依賴都在 `package.json` 中正確聲明
3. 驗證環境變量配置是否正確

### Docker 推送失敗

1. 確認 GitHub Container Registry 權限設置
2. 檢查 `GITHUB_TOKEN` 是否有 `packages: write` 權限
3. 驗證 Dockerfile 是否正確

### 安全掃描警告

1. 查看 Security 標籤頁的詳細報告
2. 更新有漏洞的依賴包
3. 如果是誤報，可以在 `.trivyignore` 中忽略

## 最佳實踐

1. **保持工作流程簡潔**：每個工作流程專注於單一職責
2. **使用緩存**：加速依賴安裝和構建過程
3. **並行執行**：獨立的檢查可以並行運行
4. **失敗快速**：將最可能失敗的步驟放在前面
5. **定期更新**：保持 Actions 版本更新

## 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
