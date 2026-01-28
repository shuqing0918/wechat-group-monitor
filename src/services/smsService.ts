/**
 * 短信通知服务
 * 
 * 注意：当前环境没有集成第三方短信服务（如阿里云短信、腾讯云短信等）
 * 这里实现了短信服务的接口层，预留了第三方短信服务的接入能力
 * 
 * 使用方式：
 * 1. 当前实现：使用控制台日志替代短信发送
 * 2. 后续扩展：在 sendSMS 方法中接入真实的第三方短信服务
 */

interface SMSConfig {
  phoneNumbers: string[];
}

interface SMSResult {
  success: boolean;
  message: string;
  details?: any;
}

export class SMSService {
  /**
   * 发送短信通知
   * 
   * @param phoneNumbers 手机号列表
   * @param content 短信内容
   * @returns 发送结果
   */
  async sendSMS(phoneNumbers: string[], content: string): Promise<SMSResult> {
    console.log('\n📱 ===== 短信通知服务 =====');
    console.log('📱 接收号码:', phoneNumbers.join(', '));
    console.log('📱 短信内容:', content);
    console.log('📱 =====================\n');

    // TODO: 在这里接入真实的第三方短信服务
    // 
    // 示例代码（阿里云短信）：
    // import Dysmsapi from '@alicloud/dysmsapi';
    // const smsClient = new Dysmsapi({
    //   accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    //   accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    // });
    // const result = await smsClient.sendSms({
    //   PhoneNumbers: phoneNumbers.join(','),
    //   SignName: '你的签名',
    //   TemplateCode: '你的模板代码',
    //   TemplateParam: JSON.stringify({ content }),
    // });

    // 示例代码（腾讯云短信）：
    // import tencentcloud from "tencentcloud-sdk-nodejs";
    // const SmsClient = tencentcloud.sms.v20210111.Client;
    // const client = new SmsClient({
    //   credential: {
    //     secretId: process.env.TENCENT_SECRET_ID,
    //     secretKey: process.env.TENCENT_SECRET_KEY,
    //   },
    //   region: process.env.TENCENT_REGION || 'ap-guangzhou',
    // });
    // const result = await client.SendSms({
    //   PhoneNumberSet: phoneNumbers.map(p => `+86${p}`),
    //   TemplateId: '你的模板ID',
    //   TemplateParamSet: [content],
    // });

    // 当前实现：返回成功（模拟发送）
    return {
      success: true,
      message: '短信已发送（模拟模式，实际未发送）',
      details: {
        phoneNumbers,
        content,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 发送"人找车"关键字检测通知
   */
  async sendKeywordAlert(keyword: string, message: string): Promise<SMSResult> {
    const content = `【微信监听】检测到关键字"${keyword}"\n消息内容：${message}\n时间：${new Date().toLocaleString('zh-CN')}`;
    
    // 从配置中获取手机号
    const { configManager } = await import('../storage/database/configManager');
    const phoneNumbers = await configManager.getSmsPhoneNumbers();

    if (phoneNumbers.length === 0) {
      console.warn('⚠️ 未配置手机号，无法发送短信通知');
      return {
        success: false,
        message: '未配置手机号，无法发送短信通知',
      };
    }

    return this.sendSMS(phoneNumbers, content);
  }
}

export const smsService = new SMSService();
