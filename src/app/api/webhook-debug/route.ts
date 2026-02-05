import { NextRequest, NextResponse } from 'next/server';

// 企业微信 URL 验证（调试版）
function verifyWeWorkURLWithDebug(msg_signature: string, timestamp: string, nonce: string, echostr: string) {
  const crypto = require('crypto');
  const token = process.env.WEWORK_TOKEN;

  console.log('🔍 [调试] 环境变量检查:');
  console.log('  WEWORK_TOKEN 是否存在:', !!token);
  console.log('  WEWORK_TOKEN 值:', token || '未配置');

  if (!token) {
    return {
      success: false,
      error: '未配置 WEWORK_TOKEN 环境变量',
    };
  }

  // 按照企业微信文档的规则排序并生成签名
  const arr = [token, timestamp, nonce].sort();
  const sortedString = arr.join('');

  console.log('🔍 [调试] 签名计算过程:');
  console.log('  原始数组:', [token, timestamp, nonce]);
  console.log('  排序后数组:', arr);
  console.log('  拼接字符串:', sortedString);

  const sha1 = crypto.createHash('sha1');
  sha1.update(sortedString);
  const signature = sha1.digest('hex');

  console.log('🔍 [调试] 签名结果:');
  console.log('  计算出的签名:', signature);
  console.log('  期望的签名:', msg_signature);
  console.log('  签名是否匹配:', signature === msg_signature);

  // 验证签名
  if (signature === msg_signature) {
    return {
      success: true,
      echostr: echostr,
      signature: signature,
      msg_signature: msg_signature,
    };
  } else {
    return {
      success: false,
      error: '签名不匹配',
      calculated_signature: signature,
      expected_signature: msg_signature,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  console.log('📥 [调试] 收到请求:', { msg_signature, timestamp, nonce, echostr });

  const debugInfo: any = {
    timestamp,
    params: {
      msg_signature: msg_signature || '未提供',
      timestamp: timestamp || '未提供',
      nonce: nonce || '未提供',
      echostr: echostr || '未提供',
    },
    env: {
      WEWORK_TOKEN: process.env.WEWORK_TOKEN || '未配置',
      WEWORK_ENCODING_AES_KEY: process.env.WEWORK_ENCODING_AES_KEY ? '已配置' : '未配置',
    },
  };

  // 如果是验证请求
  if (msg_signature && timestamp && nonce && echostr) {
    const result = verifyWeWorkURLWithDebug(msg_signature, timestamp, nonce, echostr);

    debugInfo.verification = {
      success: result.success,
      error: result.error || null,
      calculated_signature: result.calculated_signature || result.signature,
      expected_signature: result.msg_signature,
    };

    if (result.success) {
      console.log('✅ [调试] 验证成功，返回 echostr:', echostr);
      return new NextResponse(echostr, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else {
      console.error('❌ [调试] 验证失败:', result.error);
      return NextResponse.json(debugInfo, { status: 400 });
    }
  }

  // 如果不是验证请求，返回调试信息
  console.log('ℹ️ [调试] 非验证请求，返回调试信息');
  return NextResponse.json(debugInfo);
}
