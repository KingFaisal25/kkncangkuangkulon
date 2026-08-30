import api from './api';

const toFormData = (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    return form;
};

const rabService = {
    getItems: () => api.get('/rab'),
    addItem: (data) => api.post('/rab', toFormData(data)),
    updateItem: (id, data) => api.post(`/rab/${id}`, toFormData({ ...data, _method: 'PUT' })),
    deleteItem: (id) => api.delete(`/rab/${id}`),
    updateStatus: (id, status, rejection_note) => api.patch(`/rab/${id}/status`, { status, ...(rejection_note ? { rejection_note } : {}) }),
};

export default rabService;
