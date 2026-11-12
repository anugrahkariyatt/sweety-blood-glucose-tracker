import api from '../api/axios.js';

const reportService = {
  getDailyReport: async (date) => {
    const res = await api.get('/reports/daily', {
      params: { date },
    });
    return res.data;
  },

  getMonthToDateReport: async (date) => {
    const res = await api.get('/reports/month-to-date', {
      params: { date },
    });
    return res.data;
  },

  getMonthlyReport: async (date) => {
    const res = await api.get('/reports/monthly', {
      params: { date },
    });
    return res.data;
  },
};

export default reportService;
