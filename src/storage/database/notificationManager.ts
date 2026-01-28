import { eq, desc, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { 
  notifications, 
  insertNotificationSchema, 
  updateNotificationSchema,
  type Notification,
  type InsertNotification,
  type UpdateNotification 
} from "./shared/schema";

export class NotificationManager {
  /**
   * 创建通知记录
   */
  async createNotification(data: InsertNotification): Promise<Notification> {
    const db = await getDb();
    const validated = insertNotificationSchema.parse(data);
    const [notification] = await db.insert(notifications).values(validated).returning();
    return notification;
  }

  /**
   * 获取所有通知记录（按时间倒序）
   */
  async getNotifications(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Notification, 'keyword' | 'isNotified' | 'source'>>
  } = {}): Promise<Notification[]> {
    const { skip = 0, limit = 50, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.keyword !== undefined) {
      conditions.push(eq(notifications.keyword, filters.keyword));
    }
    if (filters.isNotified !== undefined) {
      conditions.push(eq(notifications.isNotified, filters.isNotified));
    }
    if (filters.source !== undefined && filters.source !== null) {
      conditions.push(eq(notifications.source, filters.source));
    }

    const query = db.select().from(notifications);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(desc(notifications.createdAt)).limit(limit).offset(skip);
  }

  /**
   * 获取通知详情
   */
  async getNotificationById(id: string): Promise<Notification | null> {
    const db = await getDb();
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || null;
  }

  /**
   * 更新通知状态
   */
  async updateNotification(id: string, data: UpdateNotification): Promise<Notification | null> {
    const db = await getDb();
    const validated = updateNotificationSchema.parse(data);
    const [notification] = await db
      .update(notifications)
      .set(validated)
      .where(eq(notifications.id, id))
      .returning();
    return notification || null;
  }

  /**
   * 标记通知为已通知
   */
  async markAsNotified(id: string): Promise<Notification | null> {
    return this.updateNotification(id, {
      isNotified: true,
      notifiedAt: new Date().toISOString(),
    });
  }

  /**
   * 删除通知
   */
  async deleteNotification(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    const db = await getDb();
    
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications);
    
    const [notifiedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(eq(notifications.isNotified, true));
    
    const [unNotifiedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(eq(notifications.isNotified, false));

    return {
      total: totalResult?.count ?? 0,
      notified: notifiedResult?.count ?? 0,
      unNotified: unNotifiedResult?.count ?? 0,
    };
  }
}

export const notificationManager = new NotificationManager();
