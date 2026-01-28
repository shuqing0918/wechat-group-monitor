import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/storage/database/configManager';

/**
 * GET 获取短信手机号列表
 */
export async function GET() {
  try {
    const phoneNumbers = await configManager.getSmsPhoneNumbers();
    
    return NextResponse.json({
      success: true,
      data: phoneNumbers,
    });
    
  } catch (error) {
    console.error('获取手机号列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取手机号列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST 设置短信手机号列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumbers } = body;
    
    if (!Array.isArray(phoneNumbers)) {
      return NextResponse.json(
        { success: false, error: 'phoneNumbers 必须是数组' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    const invalidNumbers = phoneNumbers.filter(p => !phoneRegex.test(p));
    
    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `以下手机号格式不正确: ${invalidNumbers.join(', ')}` 
        },
        { status: 400 }
      );
    }

    await configManager.setSmsPhoneNumbers(phoneNumbers);
    
    return NextResponse.json({
      success: true,
      data: phoneNumbers,
      message: `已设置 ${phoneNumbers.length} 个手机号`,
    });
    
  } catch (error) {
    console.error('设置手机号列表失败:', error);
    return NextResponse.json(
      { success: false, error: '设置手机号列表失败' },
      { status: 500 }
    );
  }
}
