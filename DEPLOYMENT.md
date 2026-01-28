# 🚀 部署指南

## 项目概述

这是一个微信群消息监听系统，通过企业微信 Webhook 接收群消息，检测关键字后通过企业微信应用发送通知。

**核心功能：**
- 接收企业微信群机器人 Webhook 消息
- 检测消息中的关键字（如"人找车"）
- 通过企业微信应用 API 发送文本通知
- 通知历史记录与统计

---

## 📋 部署前准备

### 1. 环境变量配置

在部署平台（Vercel / 本地）配置以下环境变量：

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `DATABASE_URL` | PostgreSQL 数据库连接地址 | `postgresql://user:password@host:port/dbname` |
| `WEWORK_CORP_ID` | 企业微信 Corp ID | `ww1234567890abcdef` |
| `WEWORK_AGENT_ID` | 企业应用 Agent ID | `123456` |
| `WEWORK_AGENT_SECRET` | 企业应用 Secret | `abc123xyz789` |

#### 如何获取企业微信配置信息：

1. **Corp ID**：
   - 登录企业微信管理后台：https://work.weixin.qq.com/
   - 进入"我的企业" → "企业信息" → "企业ID"

2. **Agent ID 和 Agent Secret**：
   - 进入"应用管理" → 创建或选择一个应用
   - 在应用详情页面查看"AgentId"
   - 在"凭证与基础信息"中查看"Secret"（需要企业微信管理员扫码）

3. **成员 UserID**：
   - 进入"通讯录" → 选择成员
   - 在成员详情页面查看"帐号"（即 UserID）

**未配置环境变量：**
- 系统仍可正常运行
- 企业微信通知功能将进入模拟模式（仅输出控制台日志）

---

### 2. Vercel 部署

#### 方式一：通过 Vercel CLI（推荐）

1. 安装 Vercel CLI：
```bash
pnpm add -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 按提示配置：
   - 选择创建新项目或链接到现有项目
   - 配置项目名称
   - 添加环境变量（见上方表格）

5. 部署成功后，Vercel 会提供一个生产 URL，例如：
   ```
   https://your-app.vercel.app
   ```

#### 方式二：通过 GitHub（推荐用于团队协作）

1. 将代码推送到 GitHub 仓库

2. 在 Vercel 控制台导入项目：
   - 访问 https://vercel.com/
   - 点击 "Add New" → "Project"
   - 选择 GitHub 仓库

3. 配置环境变量：
   - 在项目设置中添加所有环境变量

4. 部署：
   - Vercel 会自动检测 Next.js 项目并部署
   - 每次推送代码会自动重新部署

---

## 📡 企业微信配置

### 步骤 1：创建企业微信应用

1. 登录企业微信管理后台：https://work.weixin.qq.com/
2. 进入"应用管理"
3. 点击"创建应用"或选择现有应用
4. 填写应用信息：
   - 应用名称：微信群监听
   - 应用介绍：监听微信群消息并发送通知
5. 保存并获取 Agent ID 和 Secret

### 步骤 2：配置接收消息 Webhook

1. 在应用详情页面，找到"接收消息"配置
2. 启用"API 接收"
3. 配置回调 URL：
   - 如果是 Vercel 部署：`https://your-app.vercel.app/api/webhook`
   - 如果是本地部署：`http://localhost:5000/api/webhook`
4. 设置 Token 和 EncodingAESKey（可随机生成）
5. 保存后，企业微信会发送验证请求，确保 Webhook 接口正常

### 步骤 3：配置应用权限

1. 在应用详情页面，找到"应用权限"
2. 授予以下权限：
   - `推送消息`：允许向成员发送应用消息
   - `企业通讯录`：允许获取成员信息（如果需要）

### 步骤 4：将应用添加到微信群

1. 在企业微信客户端中，找到要监听的微信群
2. 进入群设置 → "群机器人" → "添加机器人"
3. 选择刚创建的应用
4. 复制 Webhook URL（可选，当前项目不使用此 Webhook）

**重要说明：**
- 当前项目通过企业微信应用接收消息，而非群机器人
- 群机器人 Webhook 用于接收群消息
- 应用 API 用于发送通知

---

## 🧪 本地开发

### 1. 克隆项目并安装依赖

```bash
cd /workspace/projects/
coze init . --template nextjs
```

### 2. 配置本地环境变量

创建 `.env.local` 文件：

```bash
# 数据库连接（本地开发可以使用 Supabase 免费数据库）
DATABASE_URL="postgresql://user:password@localhost:5432/wechat_monitor"

# 企业微信配置（可选，不配置会使用模拟模式）
WEWORK_CORP_ID="your_corp_id"
WEWORK_AGENT_ID="your_agent_id"
WEWORK_AGENT_SECRET="your_agent_secret"
```

### 3. 初始化数据库

```bash
pnpm install
pnpm db:push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000

---

## ✅ 验证部署

### 1. 验证 Webhook 接口

使用 curl 测试 Webhook：

```bash
curl -X POST http://localhost:5000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "人找车：今天下午从北京到上海，有人顺路吗？"
    }
  }'
```

预期响应：

```json
{
  "success": true,
  "message": "检测到关键字，已发送通知",
  "keyword": "人找车",
  "detectedAt": "2024-01-01T12:00:00.000Z"
}
```

### 2. 验证企业微信通知

1. 在应用配置页面，添加接收人 UserID
2. 发送测试消息（包含"人找车"关键字）
3. 检查企业微信客户端是否收到通知

**未配置环境变量：**
- Webhook 接口正常响应
- 企业微信通知仅在控制台输出日志
- 日志格式：
  ```
  [模拟模式] 企业微信通知（仅控制台日志）
  接收人: user1, user2
  消息内容: 检测到关键字"人找车": 人找车：今天下午从北京到上海，有人顺路吗？
  ```

### 3. 验证数据库连接

访问以下接口：

```bash
curl http://localhost:5000/api/notifications
```

预期响应：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "message": "人找车：...",
      "keyword": "人找车",
      "source": "企业微信群机器人",
      "isNotified": true,
      "notifiedAt": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 🎯 常见问题

### Q1: 企业微信通知发送失败？

**原因：**
- 环境变量未配置或配置错误
- 企业微信应用权限不足
- 接收人 UserID 不存在

**解决方法：**
1. 检查环境变量是否正确配置
2. 确认应用已授予"推送消息"权限
3. 验证接收人 UserID 是否正确

### Q2: Webhook 验证失败？

**原因：**
- Token 或 EncodingAESKey 配置错误
- Webhook URL 无法访问

**解决方法：**
1. 检查 Token 和 EncodingAESKey 是否与企业微信后台一致
2. 使用 curl 测试 Webhook URL 是否可访问

### Q3: 通知历史记录为空？

**原因：**
- 数据库连接失败
- Webhook 未正确接收消息

**解决方法：**
1. 检查 DATABASE_URL 是否正确配置
2. 查看 Webhook 接口日志，确认消息是否被接收

### Q4: 如何修改监听关键字？

当前版本仅支持"人找车"关键字，如需扩展：

1. 修改 `src/app/api/webhook/route.ts` 中的 `KEYWORDS` 数组
2. 重新部署项目

---

## 📚 相关文档

- [企业微信 API 文档](https://developer.work.weixin.qq.com/document/path/90236)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署文档](https://vercel.com/docs/deployments/overview)

---

## 🔄 更新日志

### v2.0.0（企业微信通知版本）

- ✅ 从短信通知变更为企业微信应用通知
- ✅ 新增企业微信通知服务
- ✅ 新增企业微信接收人配置 API
- ✅ 新增企业微信测试通知 API
- ✅ 支持模拟模式（未配置环境变量时）
- ✅ 更新前端配置界面

### v1.0.0（初始版本）

- ✅ 企业微信群机器人 Webhook 接收
- ✅ 关键字检测功能
- ✅ 短信通知功能（已废弃）
- ✅ 通知历史记录与统计
