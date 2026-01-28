/**
 * 企业微信应用通知服务
 * 
 * 通过企业微信 API 发送文本消息给指定用户
 * 
 * 配置环境变量：
 * - WEWORK_CORP_ID: 企业 ID
 * - WEWORK_AGENT_ID: 应用 ID
 * - WEWORK_AGENT_SECRET: 应用密钥
 */

interface WeWorkConfig {
  corpId: string;
  agentId: string;
  agentSecret: string;
}

interface NotificationResult {
  success: boolean;
  message: string;
  details?: any;
}

export class WeWorkNotificationService {
  private config: WeWorkConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  /**
   * 初始化配置
   */
  private initConfig(): void {
    if (this.config) return;

    this.config = {
      corpId: process.env.WEWORK_CORP_ID || '',
      agentId: process.env.WEWORK_AGENT_ID || '',
      agentSecret: process.env.WEWORK_AGENT_SECRET || '',
    };

    // 检查配置是否完整
    if (!this.config.corpId || !this.config.agentId || !this.config.agentSecret) {
      console.warn('⚠️ 企业微信配置不完整，通知功能将使用模拟模式');
      console.warn('请设置环境变量：WEWORK_CORP_ID, WEWORK_AGENT_ID, WEWORK_AGENT_SECRET');
    }
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 检查配置
    this.initConfig();

    if (!this.config || !this.config.corpId || !this.config.agentSecret) {
      throw new Error('企业微信配置不完整');
    }

    // 检查 token 是否过期
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 获取新 token
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.config.corpId}&corpsecret=${this.config.agentSecret}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.errcode !== 0) {
        throw new Error(`获取 access token 失败: ${data.errmsg}`);
      }

      this.accessToken = data.access_token;
      // token 有效期 7200 秒，提前 300 秒刷新
      this.tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken!;
    } catch (error) {
      console.error('获取 access token 失败:', error);
      throw error;
    }
  }

  /**
   * 发送文本消息
   * 
   * @param toUser 接收人 UserID，多个用 | 分隔，如：user1|user2
   * @param content 消息内容
   */
  async sendTextMessage(toUser: string, content: string): Promise<NotificationResult> {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;

      const payload = {
        touser: toUser,
        msgtype: 'text',
        agentid: this.config?.agentId,
        text: {
          content: content
        },
        safe: 0
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.errcode !== 0) {
        throw new Error(`发送消息失败: ${data.errmsg}`);
      }

      console.log('✅ 企业微信通知发送成功');
      console.log('📱 接收人:', toUser);
      console.log('📝 消息内容:', content);

      return {
        success: true,
        message: '企业微信通知发送成功',
        details: {
          toUser,
          content,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ 发送企业微信通知失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '发送失败',
      };
    }
  }

  /**
   * 发送"人找车"关键字检测通知
   * 
   * @param userIds 接收人 UserID 列表
   * @param keyword 关键字
   * @param message 消息内容
   * @param source 消息来源
   */
  async sendKeywordAlert(
    userIds: string[],
    keyword: string,
    message: string,
    source: string
  ): Promise<NotificationResult> {
    if (userIds.length === 0) {
      console.warn('⚠️ 未配置接收人，无法发送通知');
      return {
        success: false,
        message: '未配置接收人，无法发送通知',
      };
    }

    const toUser = userIds.join('|');
    const content = `【微信监听】检测到关键字"${keyword}"\n\n消息内容：${message}\n消息来源：${source}\n时间：${new Date().toLocaleString('zh-CN')}`;

    // 检查是否配置了企业微信
    this.initConfig();
    const hasConfig = this.config && this.config.corpId && this.config.agentId && this.config.agentSecret;

    if (!hasConfig) {
      // 模拟模式
      console.log('\n📱 ===== 企业微信通知（模拟模式）=====');
      console.log('📱 接收人:', toUser);
      console.log('📱 消息内容:');
      console.log(content);
      console.log('📱 =====================\n');

      return {
        success: true,
        message: '企业微信通知已发送（模拟模式，实际未发送）',
        details: {
          toUser,
          content,
          timestamp: new Date().toISOString(),
          mode: 'simulation',
        },
      };
    }

    // 真实发送
    return this.sendTextMessage(toUser, content);
  }

  /**
   * 发送测试消息
   * 
   * @param userIds 接收人 UserID 列表
   * @param content 消息内容
   */
  async sendTestMessage(userIds: string[], content: string): Promise<NotificationResult> {
    if (userIds.length === 0) {
      return {
        success: false,
        message: '请先配置接收人',
      };
    }

    const toUser = userIds.join('|');
    const testContent = `【测试消息】${content}\n\n发送时间：${new Date().toLocaleString('zh-CN')}`;

    return this.sendTextMessage(toUser, testContent);
  }
}

export const weWorkNotificationService = new WeWorkNotificationService();
