import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/storage/database/notificationManager';
import { weWorkNotificationService } from '@/services/weWorkNotificationService';

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

// 发送通知（记录到数据库 + 发送企业微信通知）
async function sendNotification(message: string, keyword: string, source: string): Promise<void> {
  console.log('🔔 [通知检测到关键字消息]', { keyword, message });
  
  // 1. 记录到数据库（初始状态：未通知）
  const notification = await notificationManager.createNotification({
    message,
    keyword,
    source: source || '企业微信群机器人',
    isNotified: false,
  });

  // 2. 发送企业微信通知
  try {
    const { configManager } = await import('@/storage/database/configManager');
    const userIds = await configManager.getWeWorkUserIds();

    if (userIds.length === 0) {
      console.warn('⚠️ 未配置企业微信接收人，无法发送通知');
    } else {
      const result = await weWorkNotificationService.sendKeywordAlert(
        userIds,
        keyword,
        message,
        source || '企业微信群机器人'
      );
      if (result.success) {
        console.log('✅ 企业微信通知发送成功');
        // 标记为已通知
        await notificationManager.markAsNotified(notification.id);
      } else {
        console.warn('⚠️ 企业微信通知发送失败:', result.message);
      }
    }
  } catch (error) {
    console.error('❌ 发送企业微信通知时出错:', error);
    // 通知发送失败不影响主流程
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
        await sendNotification(content, keyword, '企业微信群机器人');
        
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
