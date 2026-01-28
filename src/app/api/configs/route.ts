import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/storage/database/configManager';

/**
 * GET 获取所有配置
 */
export async function GET() {
  try {
    const configs = await configManager.getAllConfigs();
    
    // 转换为键值对格式
    const configMap: Record<string, any> = {};
    for (const config of configs) {
      // 尝试解析 JSON 值
      try {
        configMap[config.key] = {
          value: JSON.parse(config.value),
          description: config.description,
          updatedAt: config.updatedAt,
        };
      } catch {
        configMap[config.key] = {
          value: config.value,
          description: config.description,
          updatedAt: config.updatedAt,
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: configMap,
    });
    
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    );
  }
}

/**
 * POST 设置配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description } = body;
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：key 或 value' },
        { status: 400 }
      );
    }

    // 如果 value 是对象或数组，序列化为 JSON
    const finalValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    const config = await configManager.setConfig(key, finalValue, description);
    
    return NextResponse.json({
      success: true,
      data: config,
      message: '配置已更新',
    });
    
  } catch (error) {
    console.error('设置配置失败:', error);
    return NextResponse.json(
      { success: false, error: '设置配置失败' },
      { status: 500 }
    );
  }
}
