import api from './api';

const attendanceService = {
  async submitAttendance(data) {
    // data: { face_photo (base64), face_embedding (array of 128 floats) }
    const response = await api.post('/attendance', data);
    return response.data;
  },

  async getToday() {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  async getHistory() {
    const response = await api.get('/attendance/history');
    return response.data;
  },

  async getDashboard() {
    const response = await api.get('/attendance/dashboard');
    return response.data;
  },
};

export default attendanceService;
