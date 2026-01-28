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
  
  // 短信配置
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [testPhoneNumbers, setTestPhoneNumbers] = useState('');
  const [testContent, setTestContent] = useState('【测试】这是一条测试短信');
  
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

  // 加载手机号配置
  const loadPhoneNumbers = async () => {
    try {
      const response = await fetch('/api/configs/sms-phone-numbers');
      const data = await response.json();
      
      if (data.success) {
        setPhoneNumbers(data.data || []);
      }
    } catch (error) {
      console.error('加载手机号失败:', error);
    }
  };

  // 添加手机号
  const addPhoneNumber = async () => {
    if (!newPhoneNumber) return;

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(newPhoneNumber)) {
      alert('手机号格式不正确，请输入11位手机号');
      return;
    }

    const newNumbers = [...phoneNumbers, newPhoneNumber];
    
    try {
      const response = await fetch('/api/configs/sms-phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumbers: newNumbers,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhoneNumbers(newNumbers);
        setNewPhoneNumber('');
        alert('手机号添加成功！');
      } else {
        alert('添加失败：' + data.error);
      }
    } catch (error) {
      console.error('添加手机号失败:', error);
      alert('添加失败，请查看控制台');
    }
  };

  // 删除手机号
  const removePhoneNumber = async (phone: string) => {
    const newNumbers = phoneNumbers.filter(p => p !== phone);
    
    try {
      const response = await fetch('/api/configs/sms-phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumbers: newNumbers,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhoneNumbers(newNumbers);
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      console.error('删除手机号失败:', error);
      alert('删除失败，请查看控制台');
    }
  };

  // 发送测试短信
  const sendTestSMS = async () => {
    const phoneArray = testPhoneNumbers.split(',').map(p => p.trim()).filter(p => p);
    
    if (phoneArray.length === 0) {
      alert('请输入测试手机号（多个手机号用逗号分隔）');
      return;
    }

    try {
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumbers: phoneArray,
          content: testContent,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`测试短信发送成功！\n${data.message}`);
      } else {
        alert('发送失败：' + data.error);
      }
    } catch (error) {
      console.error('发送测试短信失败:', error);
      alert('发送失败，请查看控制台');
    }
  };

  // 发送测试消息（触发关键字检测 + 短信通知）
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
        alert('测试消息发送成功！\n如果已配置手机号，会同时发送短信通知。');
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
    loadPhoneNumbers();
    
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
            微信群消息监听系统
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            实时监听微信群消息，检测关键字并自动发送短信通知
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

        {/* 短信配置 */}
        <Card>
          <CardHeader>
            <CardTitle>📱 短信通知配置</CardTitle>
            <CardDescription>
              配置接收短信通知的手机号
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>⚠️ 重要说明：</strong>当前短信服务为模拟模式，短信不会实际发送。
                如需发送真实短信，需要在后端接入第三方短信服务（如阿里云短信、腾讯云短信等）。
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="输入11位手机号"
                  className="flex-1"
                  maxLength={11}
                />
                <Button onClick={addPhoneNumber} disabled={loading}>
                  添加
                </Button>
              </div>

              {phoneNumbers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    已配置的手机号：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">{phone}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoneNumber(phone)}
                          className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {phoneNumbers.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  暂未配置手机号，添加后将自动发送短信通知
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 短信测试 */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 短信测试</CardTitle>
            <CardDescription>
              测试短信发送功能（模拟模式）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                测试手机号（多个用逗号分隔）
              </label>
              <Input
                value={testPhoneNumbers}
                onChange={(e) => setTestPhoneNumbers(e.target.value)}
                placeholder="例如: 13800138000, 13900139000"
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
                placeholder="输入测试短信内容"
              />
            </div>

            <Button onClick={sendTestSMS} disabled={loading} className="w-full">
              发送测试短信
            </Button>
          </CardContent>
        </Card>

        {/* Webhook 配置说明 */}
        <Card>
          <CardHeader>
            <CardTitle>📡 Webhook 配置</CardTitle>
            <CardDescription>
              配置企业微信群机器人的 Webhook URL
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
                <li>在企业微信群中添加群机器人</li>
                <li>获取机器人的 Webhook 地址</li>
                <li>配置企业微信机器人向本服务发送消息</li>
                <li>消息中包含"人找车"关键字时会自动触发通知和短信</li>
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
              发送测试消息验证监听功能（会同时触发短信通知）
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
              如果已配置手机号，会同时发送短信通知。
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
