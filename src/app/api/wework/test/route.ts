import { NextRequest, NextResponse } from 'next/server';
import { weWorkNotificationService } from '@/services/weWorkNotificationService';

/**
 * POST 发送测试通知
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, content } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供接收人列表' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: '请提供消息内容' },
        { status: 400 }
      );
    }

    const result = await weWorkNotificationService.sendTestMessage(userIds, content);
    
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message,
    });
    
  } catch (error) {
    console.error('发送测试通知失败:', error);
    return NextResponse.json(
      { success: false, error: '发送测试通知失败' },
      { status: 500 }
    );
  }
}
