import api from './api';

const rabService = {
    // Get all RAB items, optionally filtered by division
    getItems: (divisionId = null) => {
        const params = divisionId ? `?division_id=${divisionId}` : '';
        return api.get(`/rab${params}`);
    },

    // Add item (Bendahara / admin only — enforced server-side)
    addItem: (data) => api.post('/rab', data),

    // Update item
    updateItem: (id, data) => api.put(`/rab/${id}`, data),

    // Delete item
    deleteItem: (id) => api.delete(`/rab/${id}`),
};

export default rabService;
