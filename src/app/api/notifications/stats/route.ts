import { NextResponse } from 'next/server';
import { notificationManager } from '@/storage/database/notificationManager';

/**
 * GET 获取通知统计数据
 */
export async function GET() {
  try {
    const stats = await notificationManager.getStatistics();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
