import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/services/smsService';

/**
 * POST 发送测试短信
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumbers, content } = body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供手机号列表' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: '请提供短信内容' },
        { status: 400 }
      );
    }

    const result = await smsService.sendSMS(phoneNumbers, content);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    });
    
  } catch (error) {
    console.error('发送测试短信失败:', error);
    return NextResponse.json(
      { success: false, error: '发送测试短信失败' },
      { status: 500 }
    );
  }
}
