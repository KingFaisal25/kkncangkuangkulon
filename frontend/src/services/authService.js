import api from './api';

const authService = {
  async register(data) {
    // data: { nama, nim, jurusan, password, password_confirmation, face_embedding, face_photo }
    const response = await api.post('/register', data);
    return response.data;
  },

  async login(nim, password) {
    const response = await api.post('/login', { nim, password });
    return response.data;
  },

  async adminLogin(nim, password) {
    const response = await api.post('/admin/login', { nim, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  async getUser() {
    const response = await api.get('/user');
    return response.data;
  },
};

export default authService;
