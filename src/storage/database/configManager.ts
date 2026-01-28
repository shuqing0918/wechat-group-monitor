import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { 
  configs, 
  insertConfigSchema, 
  updateConfigSchema,
  type Config,
  type InsertConfig,
  type UpdateConfig 
} from "./shared/schema";

export class ConfigManager {
  /**
   * 创建或更新配置
   */
  async setConfig(key: string, value: string, description?: string): Promise<Config> {
    const db = await getDb();
    
    // 先检查是否存在
    const [existing] = await db.select().from(configs).where(eq(configs.key, key));
    
    if (existing) {
      // 更新现有配置
      const [updated] = await db
        .update(configs)
        .set({ 
          value, 
          description,
          updatedAt: new Date().toISOString() 
        })
        .where(eq(configs.key, key))
        .returning();
      return updated;
    } else {
      // 创建新配置
      const validated = insertConfigSchema.parse({ key, value, description });
      const [created] = await db.insert(configs).values(validated).returning();
      return created;
    }
  }

  /**
   * 获取配置
   */
  async getConfig(key: string): Promise<Config | null> {
    const db = await getDb();
    const [config] = await db.select().from(configs).where(eq(configs.key, key));
    return config || null;
  }

  /**
   * 获取配置值（简化版）
   */
  async getValue(key: string): Promise<string | null> {
    const config = await this.getConfig(key);
    return config?.value || null;
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<Config[]> {
    const db = await getDb();
    return db.select().from(configs).orderBy(configs.key);
  }

  /**
   * 删除配置
   */
  async deleteConfig(key: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(configs).where(eq(configs.key, key));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 获取常用配置的便捷方法
   */
  async getSmsPhoneNumbers(): Promise<string[]> {
    const config = await this.getConfig('sms_phone_numbers');
    if (!config || !config.value) return [];
    
    try {
      return JSON.parse(config.value);
    } catch {
      return [];
    }
  }

  async setSmsPhoneNumbers(phoneNumbers: string[]): Promise<void> {
    await this.setConfig(
      'sms_phone_numbers',
      JSON.stringify(phoneNumbers),
      '接收短信通知的手机号列表（JSON 数组）'
    );
  }
}

export const configManager = new ConfigManager();
