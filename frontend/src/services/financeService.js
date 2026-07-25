import api from './api';

const financeService = {
    // Full transaction list + summary
    getAll: () => api.get('/finance'),

    // Quick summary for dashboard widget
    getSummary: () => api.get('/finance/summary'),

    // Add transaction (Bendahara / admin only — enforced server-side)
    addTransaction: (data) => api.post('/finance', data),

    // Delete transaction
    deleteTransaction: (id) => api.delete(`/finance/${id}`),
};

export default financeService;
