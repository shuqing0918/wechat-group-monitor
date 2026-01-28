import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/storage/database/configManager';

/**
 * GET 获取企业微信接收人列表
 */
export async function GET() {
  try {
    const userIds = await configManager.getWeWorkUserIds();
    
    return NextResponse.json({
      success: true,
      data: userIds,
    });
    
  } catch (error) {
    console.error('获取接收人列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取接收人列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST 设置企业微信接收人列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds } = body;
    
    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { success: false, error: 'userIds 必须是数组' },
        { status: 400 }
      );
    }

    // 验证 UserID 格式（企业微信 UserID 通常是字母或数字，长度不一）
    const invalidIds = userIds.filter(id => !id || typeof id !== 'string');
    
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `以下 UserID 格式不正确: ${invalidIds.join(', ')}` 
        },
        { status: 400 }
      );
    }

    await configManager.setWeWorkUserIds(userIds);
    
    return NextResponse.json({
      success: true,
      data: userIds,
      message: `已设置 ${userIds.length} 个接收人`,
    });
    
  } catch (error) {
    console.error('设置接收人列表失败:', error);
    return NextResponse.json(
      { success: false, error: '设置接收人列表失败' },
      { status: 500 }
    );
  }
}
