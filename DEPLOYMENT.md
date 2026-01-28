# 🚀 微信群监听系统部署指南

本指南将帮助你快速部署微信群监听系统到 Vercel（免费）。

## 📋 部署前准备

### 必备条件
- ✅ GitHub 账号（免费）
- ✅ Vercel 账号（免费）
- ✅ 企业微信账号（免费）

### 可选条件
- 📱 微信小程序账号（用于后续扩展）

---

## 🌟 方案概述

```
普通微信群 → 企业微信群机器人 → Vercel 后端 → 浏览器/小程序
                                                  ↓
                                              短信通知
```

### 优点
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 无需服务器
- ✅ 无需域名
- ✅ 自动部署

---

## 📦 第一步：部署到 Vercel

### 1.1 注册 Vercel 账号

1. 访问 https://vercel.com
2. 点击 "Sign Up" 注册
3. 选择使用 GitHub 账号登录
4. 完成注册（免费）

### 1.2 创建 GitHub 仓库

1. 在本地项目目录执行：
```bash
git init
git add .
git commit -m "Initial commit"
```

2. 在 GitHub 创建新仓库（名称如：wechat-group-monitor）
3. 推送代码到 GitHub：
```bash
git remote add origin https://github.com/你的用户名/wechat-group-monitor.git
git branch -M main
git push -u origin main
```

### 1.3 在 Vercel 导入项目

1. 登录 Vercel 控制台：https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. 选择刚才创建的 GitHub 仓库
4. 点击 "Import"

### 1.4 配置项目

在 Vercel 项目配置页面：

**Framework Preset**: Next.js

**Environment Variables**（环境变量）：
暂时不需要，当前应用不需要配置额外的环境变量

**Build and Output Settings**：
- Build Command: `pnpm run build`
- Output Directory: `.next`
- Install Command: `pnpm install`

点击 "Deploy" 开始部署。

### 1.5 等待部署完成

- 部署通常需要 1-3 分钟
- 部署成功后会显示一个 `.vercel.app` 域名
- 例如：`https://wechat-group-monitor.vercel.app`

**记录你的域名**，后面需要用到！

---

## 🤖 第二步：配置企业微信群机器人

### 2.1 在目标微信群中添加机器人

1. 打开你要监听的微信群
2. 点击群聊右上角的 "..."
3. 找到 "群机器人" 或 "群工具"
4. 点击 "添加机器人"
5. 选择 "自定义机器人"
6. 给机器人命名（如：消息监听机器人）
7. 点击 "添加"

### 2.2 获取 Webhook URL

添加成功后，你会看到一个 Webhook URL，格式类似：
```
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx
```

**重要**：复制这个 URL，后面需要用到！

### 2.3 配置机器人转发（关键步骤）

企业微信群机器人**不能直接**向外部 Webhook 发送消息。

**解决方案**：使用企业微信的"消息推送"功能。

#### 选项 A：使用企业微信应用（推荐）

1. 登录企业微信管理后台：https://work.weixin.qq.com
2. 进入"应用管理" → "自建应用"
3. 创建一个新应用（名称：群消息监听）
4. 配置应用的"接收消息"回调 URL：
   - 回调 URL：`https://你的vercel域名/api/webhook`
   - Token 和 EncodingAESKey：随机生成并记录
5. 启用"接收消息"功能

#### 选项 B：使用第三方转发服务（简单）

如果选项 A 太复杂，可以使用企业微信的"外部联系人"功能：
1. 将机器人配置为向特定外部联系人发送消息
2. 外部联系人通过 Webhook 接收消息
3. 推送到你的 Vercel 后端

---

## 🔗 第三步：配置 Webhook 连接

### 3.1 确认你的 Vercel 域名

部署完成后，Vercel 会提供一个域名，例如：
```
https://wechat-group-monitor.vercel.app
```

### 3.2 配置企业微信应用回调 URL

1. 登录企业微信管理后台
2. 进入你创建的应用
3. 找到"接收消息"设置
4. 设置回调 URL：`https://你的域名/api/webhook`
5. 保存配置

### 3.3 测试连接

在浏览器访问：
```
https://你的域名/api/webhook
```

应该看到：
```json
{
  "status": "running",
  "keywords": ["人找车"],
  "message": "微信群监听 Webhook 服务运行中",
  "timestamp": "2026-01-28T06:00:00.000Z"
}
```

---

## 📱 第四步：使用系统

### 4.1 访问应用

打开浏览器，访问：
```
https://你的域名
```

你会看到：
- 📊 统计概览（总通知数、已通知、待处理）
- 📱 短信通知配置
- 🧪 短信测试
- 📡 Webhook 配置说明
- 🔍 关键字检测测试
- 📋 通知记录列表

### 4.2 配置短信手机号

1. 在"短信通知配置"卡片中
2. 输入 11 位手机号
3. 点击"添加"
4. 可以添加多个手机号

### 4.3 测试关键字检测

1. 在"关键字检测测试"卡片中
2. 输入测试消息（必须包含"人找车"）
3. 点击"发送测试"
4. 查看"通知记录"列表，会新增一条记录

### 4.4 测试短信发送

1. 在"短信测试"卡片中
2. 输入测试手机号
3. 输入测试内容
4. 点击"发送测试短信"
5. 查看控制台日志（当前为模拟模式）

---

## 🔔 第五步：监听微信群消息

### 5.1 确保企业微信应用配置正确

1. 企业微信应用的回调 URL 已设置
2. 应用已启用"接收消息"功能
3. 应用已添加到要监听的微信群

### 5.2 在群中发送测试消息

在目标微信群中发送：
```
人找车：今天下午从北京到上海，有人顺路吗？
```

### 5.3 查看通知记录

刷新应用页面，"通知记录"列表应该会新增一条记录，包含：
- 消息内容
- 关键字（人找车）
- 来源（企业微信）
- 创建时间

---

## 📊 API 接口说明

### Webhook 接收消息
```
POST /api/webhook
```

### 获取通知列表
```
GET /api/notifications?limit=20
```

### 获取统计数据
```
GET /api/notifications/stats
```

### 设置手机号
```
POST /api/configs/sms-phone-numbers
Content-Type: application/json

{
  "phoneNumbers": ["13800138000", "13900139000"]
}
```

### 发送测试短信
```
POST /api/sms/test
Content-Type: application/json

{
  "phoneNumbers": ["13800138000"],
  "content": "【测试】这是一条测试短信"
}
```

---

## ⚠️ 重要提示

### 关于短信服务
- ⚠️ 当前短信服务为**模拟模式**
- ⚠️ 短信不会实际发送，只在控制台输出日志
- ✅ 如需发送真实短信，需要接入第三方短信服务（阿里云/腾讯云）

### 接入真实短信服务

修改 `src/services/smsService.ts`，在 `sendSMS` 方法中接入第三方短信服务：

#### 阿里云短信示例

1. 安装依赖：
```bash
pnpm add @alicloud/dysmsapi
```

2. 配置环境变量：
```bash
# 在 Vercel 项目设置中添加
ALIYUN_ACCESS_KEY_ID=your_key_id
ALIYUN_ACCESS_KEY_SECRET=your_key_secret
ALIYUN_SMS_SIGN_NAME=你的签名
ALIYUN_SMS_TEMPLATE_CODE=你的模板代码
```

3. 修改 `src/services/smsService.ts`：
```typescript
import Dysmsapi from '@alicloud/dysmsapi';

const smsClient = new Dysmsapi({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
});

async function sendSMS(phoneNumbers: string[], content: string) {
  const result = await smsClient.sendSms({
    PhoneNumbers: phoneNumbers.join(','),
    SignName: process.env.ALIYUN_SMS_SIGN_NAME,
    TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
    TemplateParam: JSON.stringify({ content }),
  });
  return result;
}
```

---

## 🎯 后续扩展

### 添加微信小程序

如果你想添加小程序前端：

1. 注册微信小程序账号
2. 购买域名并备案
3. 在小程序中调用 Vercel 的 API
4. 参考 `小程序代码框架` 目录

### 添加更多关键字

修改 `src/app/api/webhook/route.ts`：
```typescript
const KEYWORDS = ['人找车', '车找人', '拼车', '顺风车'];
```

### 添加更多通知方式

- 邮件通知（使用 Nodemailer）
- 钉钉机器人通知
- 飞书机器人通知
- 企业微信应用通知

---

## 🆘 常见问题

### Q1: 部署后无法访问？
**A**: 检查 Vercel 部署日志，确保构建成功。等待 1-2 分钟让 DNS 生效。

### Q2: Webhook 没有接收到消息？
**A**: 检查企业微信应用的回调 URL 是否正确，是否启用了"接收消息"功能。

### Q3: 短信没有发送？
**A**: 当前为模拟模式，需要接入第三方短信服务才能实际发送。

### Q4: 如何监听多个群？
**A**: 在每个群中都添加企业微信机器人/应用，配置相同的回调 URL。

### Q5: Vercel 免费额度用完了怎么办？
**A**:
- 免费额度：100GB 带宽/月
- 如果超限，可以考虑：
  - 使用腾讯云 Serverless（免费额度）
  - 购买 Vercel Pro 计划（$20/月）
  - 部署到自己的服务器

---

## 📞 获取帮助

如果遇到问题：
1. 查看 Vercel 部署日志
2. 查看企业微信应用配置
3. 检查浏览器控制台错误
4. 查看 API 响应

---

## 🎉 完成！

恭喜你！现在你已经成功部署了微信群监听系统。

- ✅ 系统运行在 Vercel（免费）
- ✅ 可以监听微信群消息
- ✅ 检测"人找车"关键字
- ✅ 支持短信通知（需配置第三方服务）
- ✅ 完整的 Web 管理界面

享受你的自动化监听系统吧！🚀
