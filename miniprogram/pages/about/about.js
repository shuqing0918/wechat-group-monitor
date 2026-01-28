// pages/about/about.js
Page({
  data: {
    version: '1.0.0'
  },

  onLoad() {
    // 页面加载
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === 'about') {
      return; // 当前页
    }
    
    wx.switchTab({
      url: `/pages/${tab}/${tab}`
    });
  }
});
