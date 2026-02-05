import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/storage/database/notificationManager';
import { weWorkNotificationService } from '@/services/weWorkNotificationService';

// 关键字配置
const KEYWORDS = ['车'];

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

// 企业微信 URL 验证
function verifyWeWorkURL(msg_signature: string, timestamp: string, nonce: string, echostr: string): string | null {
  const token = process.env.WEWORK_TOKEN;

  console.log('🔍 [验证] 环境变量检查:');
  console.log('  WEWORK_TOKEN 是否存在:', !!token);
  console.log('  WEWORK_TOKEN 值:', token || '未配置');

  if (!token) {
    console.error('⚠️ 未配置 WEWORK_TOKEN 环境变量，无法验证企业微信 URL');
    return null;
  }

  // 按照企业微信文档的规则排序并生成签名
  const crypto = require('crypto');
  const arr = [token, timestamp, nonce].sort();
  const sortedString = arr.join('');

  console.log('🔍 [验证] 签名计算过程:');
  console.log('  原始数组:', [token, timestamp, nonce]);
  console.log('  排序后数组:', arr);
  console.log('  拼接字符串:', sortedString);

  const sha1 = crypto.createHash('sha1');
  sha1.update(sortedString);
  const signature = sha1.digest('hex');

  console.log('🔍 [验证] 签名结果:');
  console.log('  计算出的签名:', signature);
  console.log('  企业微信发送的签名:', msg_signature);
  console.log('  签名是否匹配:', signature === msg_signature);

  // 验证签名
  if (signature === msg_signature) {
    console.log('✅ [验证] 签名匹配成功，返回 echostr:', echostr);
    return echostr; // 返回 echostr 以通过验证
  } else {
    console.error('❌ 企业微信 URL 验证失败：签名不匹配');
    return null;
  }
}

// GET 方法用于企业微信 URL 验证
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  console.log('📥 收到企业微信 URL 验证请求:', { msg_signature, timestamp, nonce, echostr });

  // 如果是企业微信的 URL 验证请求
  if (msg_signature && timestamp && nonce && echostr) {
    const echostrReturn = verifyWeWorkURL(msg_signature, timestamp, nonce, echostr);

    if (echostrReturn) {
      console.log('✅ 企业微信 URL 验证成功');
      return new NextResponse(echostrReturn, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else {
      console.error('❌ 企业微信 URL 验证失败');
      return NextResponse.json(
        { error: '验证失败' },
        { status: 403 }
      );
    }
  }

  // 否则返回服务状态
  return NextResponse.json({
    status: 'running',
    keywords: KEYWORDS,
    message: '微信群监听 Webhook 服务运行中',
    timestamp: new Date().toISOString(),
  });
}
