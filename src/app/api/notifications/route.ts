import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/storage/database/notificationManager';

/**
 * GET 获取通知列表
 * 查询参数：
 * - skip: 跳过数量（用于分页）
 * - limit: 每页数量
 * - keyword: 关键字过滤
 * - isNotified: 是否已通知过滤
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const keyword = searchParams.get('keyword') || undefined;
    const isNotified = searchParams.get('isNotified');
    
    const notifications = await notificationManager.getNotifications({
      skip,
      limit,
      filters: {
        keyword: keyword || undefined,
        isNotified: isNotified ? isNotified === 'true' : undefined,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
    
  } catch (error) {
    console.error('获取通知列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取通知列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST 创建测试通知（用于测试功能）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, keyword, source } = body;
    
    if (!message || !keyword) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：message 或 keyword' },
        { status: 400 }
      );
    }
    
    const notification = await notificationManager.createNotification({
      message,
      keyword,
      source: source || '手动测试',
      isNotified: true,
    });
    
    return NextResponse.json({
      success: true,
      data: notification,
      message: '测试通知创建成功',
    });
    
  } catch (error) {
    console.error('创建测试通知失败:', error);
    return NextResponse.json(
      { success: false, error: '创建测试通知失败' },
      { status: 500 }
    );
  }
}
