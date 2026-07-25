import api from './api';

const divisionService = {
    // Get all divisions with members & progress
    getDivisions: () => api.get('/divisions'),

    // Get all reports, optionally for one division
    getReports: (divisionId = null) => {
        const params = divisionId ? `?division_id=${divisionId}` : '';
        return api.get(`/division-reports${params}`);
    },

    // Get reports grouped by division (for dashboard widget)
    getByDivision: () => api.get('/division-reports/by-division'),

    // Submit a report (with optional base64 foto_bukti)
    createReport: (data) => api.post('/division-reports', data),

    // Update a report
    updateReport: (id, data) => api.put(`/division-reports/${id}`, data),

    // Delete a report
    deleteReport: (id) => api.delete(`/division-reports/${id}`),

    // ---- Admin: Division CRUD ----
    createDivision: (data) => api.post('/admin/divisions', data),
    updateDivision: (id, data) => api.put(`/admin/divisions/${id}`, data),
    deleteDivision: (id) => api.delete(`/admin/divisions/${id}`),

    // Assign / unassign user to division
    assignUser: (divisionId, userId) =>
        api.post(`/admin/divisions/${divisionId}/assign`, { user_id: userId }),
    unassignUser: (userId) =>
        api.post('/admin/divisions/unassign', { user_id: userId }),
};

export default divisionService;
