import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/storage/database/notificationManager';
import { smsService } from '@/services/smsService';

// 关键字配置
const KEYWORDS = ['人找车'];

// Webhook 请求类型（企业微信机器人）
interface WebhookMessage {
  msgtype: string;
  text?: {
    content: string;
    mentioned_list?: string[];
  };
}

// 检测消息是否包含关键字
function containsKeywords(content: string): string | null {
  return KEYWORDS.find(keyword => content.includes(keyword)) || null;
}

// 发送通知（记录到数据库 + 发送短信）
async function sendNotification(message: string, keyword: string): Promise<void> {
  console.log('🔔 [通知检测到关键字消息]', { keyword, message });
  
  // 1. 记录到数据库
  await notificationManager.createNotification({
    message,
    keyword,
    source: '企业微信群机器人',
    isNotified: true,
  });

  // 2. 发送短信通知（如果配置了手机号）
  try {
    const smsResult = await smsService.sendKeywordAlert(keyword, message);
    if (smsResult.success) {
      console.log('✅ 短信通知发送成功');
    } else {
      console.warn('⚠️ 短信通知发送失败:', smsResult.message);
    }
  } catch (error) {
    console.error('❌ 发送短信通知时出错:', error);
    // 短信发送失败不影响主流程
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookMessage = await request.json();
    
    // 目前只处理文本消息
    if (body.msgtype === 'text' && body.text?.content) {
      const content = body.text.content;
      
      // 检测关键字
      const keyword = containsKeywords(content);
      
      if (keyword) {
        // 发送通知并记录到数据库
        await sendNotification(content, keyword);
        
        return NextResponse.json({
          success: true,
          message: '检测到关键字，已发送通知',
          keyword,
          detectedAt: new Date().toISOString(),
        });
      }
    }
    
    // 没有关键字或其他类型消息
    return NextResponse.json({
      success: true,
      message: '消息已接收，未检测到关键字',
    });
    
  } catch (error) {
    console.error('Webhook 处理错误:', error);
    return NextResponse.json(
      { success: false, error: '处理消息失败' },
      { status: 500 }
    );
  }
}

// GET 方法用于验证 Webhook 配置
export async function GET() {
  return NextResponse.json({
    status: 'running',
    keywords: KEYWORDS,
    message: '微信群监听 Webhook 服务运行中',
    timestamp: new Date().toISOString(),
  });
}
