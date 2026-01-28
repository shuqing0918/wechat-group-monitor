// pages/config/config.js
const app = getApp();

Page({
  data: {
    phoneNumbers: [],
    phoneNumber: '',
    adding: false
  },

  onLoad() {
    this.loadPhoneNumbers();
  },

  onShow() {
    this.loadPhoneNumbers();
  },

  // 加载手机号列表
  loadPhoneNumbers() {
    this.setData({
      phoneNumbers: app.globalData.phoneNumbers
    });
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 添加手机号
  async addPhoneNumber() {
    const { phoneNumber } = this.data;

    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    // 检查是否已存在
    if (this.data.phoneNumbers.includes(phoneNumber)) {
      wx.showToast({
        title: '手机号已存在',
        icon: 'none'
      });
      return;
    }

    this.setData({ adding: true });

    try {
      const result = await app.addPhoneNumber(phoneNumber);

      if (result.success) {
        this.setData({
          phoneNumbers: [...this.data.phoneNumbers, phoneNumber],
          phoneNumber: ''
        });
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.message || '添加失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('添加手机号失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    } finally {
      this.setData({ adding: false });
    }
  },

  // 删除手机号
  async deletePhoneNumber(e) {
    const phone = e.currentTarget.dataset.phone;

    wx.showModal({
      title: '确认删除',
      content: `确定删除手机号 ${phone} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await app.removePhoneNumber(phone);

            if (result.success) {
              const newNumbers = this.data.phoneNumbers.filter(p => p !== phone);
              this.setData({
                phoneNumbers: newNumbers
              });
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('删除手机号失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === 'config') {
      return; // 当前页
    }
    
    wx.switchTab({
      url: `/pages/${tab}/${tab}`
    });
  }
});
