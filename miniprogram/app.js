// app.js
App({
  globalData: {
    // 配置你的 Vercel 域名
    baseUrl: 'https://你的vercel域名.vercel.app',
    
    // 当前手机号配置
    phoneNumbers: [],
    
    // 通知列表
    notifications: [],
    
    // 统计数据
    stats: {
      total: 0,
      notified: 0,
      unNotified: 0
    }
  },

  onLaunch() {
    console.log('小程序启动');
    this.loadPhoneNumbers();
    this.loadNotifications();
    this.loadStats();
  },

  // 加载手机号配置
  async loadPhoneNumbers() {
    try {
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/configs/sms-phone-numbers`,
        method: 'GET',
      });
      
      if (res.data.success) {
        this.globalData.phoneNumbers = res.data.data || [];
      }
    } catch (error) {
      console.error('加载手机号失败:', error);
    }
  },

  // 加载通知列表
  async loadNotifications() {
    try {
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/notifications?limit=20`,
        method: 'GET',
      });
      
      if (res.data.success) {
        this.globalData.notifications = res.data.data || [];
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/notifications/stats`,
        method: 'GET',
      });
      
      if (res.data.success) {
        this.globalData.stats = res.data.data || { total: 0, notified: 0, unNotified: 0 };
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  },

  // 添加手机号
  async addPhoneNumber(phoneNumber) {
    try {
      const newNumbers = [...this.globalData.phoneNumbers, phoneNumber];
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/configs/sms-phone-numbers`,
        method: 'POST',
        data: {
          phoneNumbers: newNumbers
        },
      });
      
      if (res.data.success) {
        this.globalData.phoneNumbers = newNumbers;
        return { success: true };
      }
      return { success: false, message: res.data.error };
    } catch (error) {
      console.error('添加手机号失败:', error);
      return { success: false, message: '添加失败' };
    }
  },

  // 删除手机号
  async removePhoneNumber(phoneNumber) {
    try {
      const newNumbers = this.globalData.phoneNumbers.filter(p => p !== phoneNumber);
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/configs/sms-phone-numbers`,
        method: 'POST',
        data: {
          phoneNumbers: newNumbers
        },
      });
      
      if (res.data.success) {
        this.globalData.phoneNumbers = newNumbers;
        return { success: true };
      }
      return { success: false, message: res.data.error };
    } catch (error) {
      console.error('删除手机号失败:', error);
      return { success: false, message: '删除失败' };
    }
  }
});
