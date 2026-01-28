'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Notification {
  id: string;
  message: string;
  keyword: string;
  source: string | null;
  isNotified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

interface Statistics {
  total: number;
  notified: number;
  unNotified: number;
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Statistics>({ total: 0, notified: 0, unNotified: 0 });
  const [loading, setLoading] = useState(true);
  
  // 企业微信接收人配置
  const [userIds, setUserIds] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [testUserIds, setTestUserIds] = useState('');
  const [testContent, setTestContent] = useState('这是一条测试通知');
  
  // 测试消息
  const [testMessage, setTestMessage] = useState('人找车：今天下午从北京到上海，有人顺路吗？');

  // 加载通知列表
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  // 加载企业微信接收人配置
  const loadUserIds = async () => {
    try {
      const response = await fetch('/api/configs/wework-user-ids');
      const data = await response.json();
      
      if (data.success) {
        setUserIds(data.data || []);
      }
    } catch (error) {
      console.error('加载接收人失败:', error);
    }
  };

  // 添加接收人
  const addUserId = async () => {
    if (!newUserId) return;

    const newUserIds = [...userIds, newUserId];
    
    try {
      const response = await fetch('/api/configs/wework-user-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: newUserIds,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserIds(newUserIds);
        setNewUserId('');
        alert('接收人添加成功！');
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      console.error('添加接收人失败:', error);
      alert('添加失败，请查看控制台');
    }
  };

  // 删除接收人
  const removeUserId = async (userId: string) => {
    const newUserIds = userIds.filter(u => u !== userId);
    
    try {
      const response = await fetch('/api/configs/wework-user-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: newUserIds,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserIds(newUserIds);
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      console.error('删除接收人失败:', error);
      alert('删除失败，请查看控制台');
    }
  };

  // 发送测试通知
  const sendTestNotification = async () => {
    const userIdArray = testUserIds.split(',').map(u => u.trim()).filter(u => u);
    
    if (userIdArray.length === 0) {
      alert('请输入测试接收人（多个用逗号分隔）');
      return;
    }

    try {
      const response = await fetch('/api/wework/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: userIdArray,
          content: testContent,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`测试通知发送成功！\n${data.message}`);
      } else {
        alert('发送失败：' + data.error);
      }
    } catch (error) {
      console.error('发送测试通知失败:', error);
      alert('发送失败，请查看控制台');
    }
  };

  // 发送测试消息（触发关键字检测 + 企业微信通知）
  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          keyword: '人找车',
          source: '手动测试',
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('测试消息发送成功！\n如果已配置接收人，会同时发送企业微信通知。');
        loadNotifications();
        loadStats();
      } else {
        alert('发送失败：' + data.error);
      }
    } catch (error) {
      console.error('发送测试消息失败:', error);
      alert('发送失败，请查看控制台');
    }
  };

  // 初始加载
  useEffect(() => {
    loadNotifications();
    loadStats();
    loadUserIds();
    
    // 每 10 秒自动刷新数据
    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页头 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
            微信群监听系统
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            实时监听微信群消息，检测关键字并发送企业微信通知
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                总通知数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                已通知
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.notified}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                待处理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.unNotified}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 企业微信通知配置 */}
        <Card>
          <CardHeader>
            <CardTitle>💼 企业微信通知配置</CardTitle>
            <CardDescription>
              配置接收企业微信通知的用户（UserID）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>⚠️ 重要说明：</strong>
                <br />
                1. 配置环境变量：<code>WEWORK_CORP_ID</code>、<code>WEWORK_AGENT_ID</code>、<code>WEWORK_AGENT_SECRET</code>
                <br />
                2. 在企业微信管理后台查看成员的 UserID
                <br />
                3. 未配置环境变量时，通知为模拟模式（控制台日志）
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="输入企业微信成员 UserID"
                  className="flex-1"
                />
                <Button onClick={addUserId} disabled={loading}>
                  添加
                </Button>
              </div>

              {userIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    已配置的接收人：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userIds.map((userId, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">{userId}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUserId(userId)}
                          className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userIds.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  暂未配置接收人，添加后将自动发送企业微信通知
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 企业微信通知测试 */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 企业微信通知测试</CardTitle>
            <CardDescription>
              测试企业微信通知功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                测试接收人（多个用逗号分隔）
              </label>
              <Input
                value={testUserIds}
                onChange={(e) => setTestUserIds(e.target.value)}
                placeholder="例如: user1, user2, user3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                测试内容
              </label>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-transparent"
                placeholder="输入测试通知内容"
              />
            </div>

            <Button onClick={sendTestNotification} disabled={loading} className="w-full">
              发送测试通知
            </Button>
          </CardContent>
        </Card>

        {/* Webhook 配置说明 */}
        <Card>
          <CardHeader>
            <CardTitle>📡 Webhook 配置</CardTitle>
            <CardDescription>
              配置企业微信应用的 Webhook URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>当前 Webhook URL：</strong>
                <code className="ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook` : '/api/webhook'}
                </code>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>📝 <strong>配置步骤：</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>在企业微信管理后台创建应用</li>
                <li>配置应用的"接收消息"回调 URL</li>
                <li>将应用添加到要监听的微信群</li>
                <li>配置环境变量：WEWORK_CORP_ID、WEWORK_AGENT_ID、WEWORK_AGENT_SECRET</li>
                <li>消息中包含"人找车"关键字时会自动触发通知</li>
              </ol>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                当前监听关键字：
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="px-3 py-1">
                  人找车
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试功能 */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 关键字检测测试</CardTitle>
            <CardDescription>
              发送测试消息验证监听功能（会同时触发企业微信通知）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="输入测试消息（包含关键字）"
                className="flex-1"
              />
              <Button onClick={sendTestMessage} disabled={loading}>
                发送测试
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              点击发送测试按钮，模拟收到包含关键字的微信群消息。
              如果已配置接收人，会同时发送企业微信通知。
            </p>
          </CardContent>
        </Card>

        {/* 通知列表 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 通知记录</CardTitle>
            <CardDescription>
              实时显示检测到的关键字消息（每 10 秒自动刷新）
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                加载中...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无通知记录
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{notification.keyword}</Badge>
                          {notification.source && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {notification.source}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-50 font-medium">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>创建时间：{formatDate(notification.createdAt)}</span>
                          {notification.notifiedAt && (
                            <span>通知时间：{formatDate(notification.notifiedAt)}</span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={notification.isNotified ? 'default' : 'secondary'}
                      >
                        {notification.isNotified ? '已通知' : '待处理'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadNotifications();
                    loadStats();
                  }}
                  disabled={loading}
                >
                  {loading ? '刷新中...' : '手动刷新'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
