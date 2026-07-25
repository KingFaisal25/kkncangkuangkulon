import api from './api';

const adminService = {
  async getDashboard(date = null) {
    const params = date ? { date } : {};
    const response = await api.get('/admin/dashboard/progress', { params });
    return response.data;
  },

  async getUsers(params = {}) {
    // params: { search, page, per_page }
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getAttendance(params = {}) {
    // params: { date_from, date_to, status, search, page, per_page }
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },

  async getSummary(params = {}) {
    const response = await api.get('/admin/attendance/summary', { params });
    return response.data;
  },

  async exportExcel(params = {}) {
    const response = await api.get('/admin/export', {
      params,
      responseType: 'blob',
    });
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-absensi-${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
};

export default adminService;
