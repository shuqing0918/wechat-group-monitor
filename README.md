# 🤖 微信群监听系统

实时监听微信群消息，检测"人找车"关键字并发送短信通知。

## ✨ 功能特性

- ✅ **实时监听**：监听微信群消息
- ✅ **关键字检测**：自动检测"人找车"关键字
- ✅ **短信通知**：支持短信通知（需配置第三方服务）
- ✅ **Web 管理界面**：完整的前端管理页面
- ✅ **小程序支持**：提供微信小程序版本
- ✅ **数据统计**：通知记录和统计数据
- ✅ **多手机号**：支持配置多个接收手机号

## 🏗️ 技术架构

```
普通微信群 → 企业微信群机器人 → Next.js 后端 → 浏览器/小程序
                                                  ↓
                                              短信通知
```

### 技术栈

- **前端**：Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4
- **小程序**：微信小程序原生框架
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL + Drizzle ORM
- **部署**：Vercel（免费）

## 📂 项目结构

```
wechat-group-monitor/
├── src/
│   ├── app/
│   │   ├── api/                 # API 路由
│   │   │   ├── webhook/         # 企业微信 Webhook
│   │   │   ├── notifications/   # 通知管理 API
│   │   │   ├── configs/         # 配置管理 API
│   │   │   └── sms/             # 短信服务 API
│   │   ├── page.tsx             # Web 前端主页
│   │   └── layout.tsx           # 布局组件
│   ├── components/
│   │   └── ui/                  # shadcn/ui 组件
│   ├── services/
│   │   └── smsService.ts        # 短信服务
│   └── storage/
│       └── database/
│           ├── shared/
│           │   └── schema.ts    # 数据库模型
│           ├── notificationManager.ts
│           └── configManager.ts
├── miniprogram/                  # 微信小程序代码
│   ├── pages/
│   │   ├── index/               # 通知列表页
│   │   ├── config/              # 配置页
│   │   └── about/               # 关于页
│   ├── app.js
│   └── app.json
├── DEPLOYMENT.md                 # Vercel 部署指南
├── WECHAT_ROBOT_GUIDE.md         # 企业微信配置指南
├── MINIPROGRAM_GUIDE.md          # 小程序部署指南
└── README.md                     # 本文件
```

## 🚀 快速开始

### 选项 A：部署 Web 版（推荐新手）

**适用场景**：快速使用，无需复杂配置

**部署步骤**：
1. 阅读 [Vercel 部署指南](./DEPLOYMENT.md)
2. 阅读企业微信群机器人配置指南
3. 完成 Vercel 部署
4. 配置企业微信应用
5. 开始使用

**预计时间**：30 分钟

### 选项 B：部署小程序版本

**适用场景**：需要移动端访问

**前置条件**：
- 微信小程序账号
- 域名和备案
- 后端服务已部署

**部署步骤**：
1. 完成 Web 版部署（选项 A）
2. 阅读 [小程序部署指南](./MINIPROGRAM_GUIDE.md)
3. 配置小程序服务器域名
4. 上传小程序代码
5. 提交审核

**预计时间**：1-2 小时 + 1-7 天审核

## 📖 详细文档

### 部署相关

| 文档 | 说明 |
|------|------|
| [Vercel 部署指南](./DEPLOYMENT.md) | 如何部署到 Vercel（免费） |
| [企业微信群机器人配置指南](./WECHAT_ROBOT_GUIDE.md) | 如何配置企业微信接收群消息 |
| [小程序部署指南](./MINIPROGRAM_GUIDE.md) | 如何部署微信小程序版本 |

### API 接口

#### Webhook 接收消息
```http
POST /api/webhook
Content-Type: application/json

{
  "msgtype": "text",
  "text": {
    "content": "人找车：今天下午从北京到上海"
  }
}
```

#### 获取通知列表
```http
GET /api/notifications?limit=20
```

#### 获取统计数据
```http
GET /api/notifications/stats
```

#### 设置手机号
```http
POST /api/configs/sms-phone-numbers
Content-Type: application/json

{
  "phoneNumbers": ["13800138000", "13900139000"]
}
```

#### 发送测试短信
```http
POST /api/sms/test
Content-Type: application/json

{
  "phoneNumbers": ["13800138000"],
  "content": "【测试】这是一条测试短信"
}
```

## 🔧 配置说明

### 短信服务配置

当前短信服务为**模拟模式**，短信不会实际发送。

**接入真实短信服务**：

修改 `src/services/smsService.ts`，在 `sendSMS` 方法中接入第三方短信服务：

**阿里云短信**：
```typescript
import Dysmsapi from '@alicloud/dysmsapi';

const smsClient = new Dysmsapi({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
});

const result = await smsClient.sendSms({
  PhoneNumbers: phoneNumbers.join(','),
  SignName: '你的签名',
  TemplateCode: '你的模板代码',
  TemplateParam: JSON.stringify({ content }),
});
```

**腾讯云短信**：
```typescript
import tencentcloud from "tencentcloud-sdk-nodejs";
const SmsClient = tencentcloud.sms.v20210111.Client;

const client = new SmsClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: process.env.TENCENT_REGION || 'ap-guangzhou',
});

const result = await client.SendSms({
  PhoneNumberSet: phoneNumbers.map(p => `+86${p}`),
  TemplateId: '你的模板ID',
  TemplateParamSet: [content],
});
```

### 关键字配置

修改 `src/app/api/webhook/route.ts`：

```typescript
const KEYWORDS = ['人找车', '车找人', '拼车', '顺风车'];
```

## ⚠️ 重要说明

### 关于微信监听

| 平台 | 是否支持 | 说明 |
|------|----------|------|
| 普通微信（个人） | ❌ | 无 API，无法监听 |
| 企业微信群机器人 | ✅ | 推荐，稳定可靠 |
| 微信小程序 | ❌ | 无法获取群消息 |

**推荐方案**：使用企业微信群机器人监听普通微信群。

### 关于短信服务

| 状态 | 说明 |
|------|------|
| 当前状态 | 模拟模式（控制台日志） |
| 真实发送 | 需接入第三方短信服务 |
| 费用 | 第三方短信服务收费 |

## 🆘 常见问题

### Q1: 部署后无法访问？
**A**: 检查 Vercel 部署日志，确保构建成功。

### Q2: Webhook 没有接收到消息？
**A**: 检查企业微信应用的回调 URL 配置。

### Q3: 短信没有发送？
**A**: 当前为模拟模式，需要接入第三方短信服务。

### Q4: 如何监听多个群？
**A**: 在每个群中都添加企业微信机器人/应用。

### Q5: Vercel 免费额度用完了怎么办？
**A**: 免费额度 100GB/月，超限可购买 Pro 计划或使用云服务器。

## 📞 技术支持

如有问题，请参考：
- 部署指南
- 配置指南
- API 文档
- 查看日志输出

## 📄 许可证

MIT License

## 🙏 致谢

- Next.js
- shadcn/ui
- Vercel
- 微信企业微信
- Drizzle ORM

---

**开始使用**：[Vercel 部署指南](./DEPLOYMENT.md) 🚀
