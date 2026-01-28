// pages/index/index.js
const app = getApp();

Page({
  data: {
    stats: {
      total: 0,
      notified: 0,
      unNotified: 0
    },
    notifications: [],
    loading: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });

    try {
      // 并行加载所有数据
      await Promise.all([
        app.loadNotifications(),
        app.loadStats()
      ]);

      this.setData({
        notifications: app.globalData.notifications,
        stats: app.globalData.stats
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 刷新数据
  refreshData() {
    this.loadData();
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === 'index') {
      return; // 当前页
    }
    
    wx.switchTab({
      url: `/pages/${tab}/${tab}`
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  }
});
