"use client";

const BASE_URL = ''; // Use relative paths for Vite proxy

const request = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('cafe_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('cafe_user');
    window.location.reload();
  }

  if (!res.ok) throw new Error('API Error');
  return res.json();
};

export const api = {
  auth: async (username, password) => {
    const data = await request('/auth', { method: 'POST', body: JSON.stringify({ username, password }) });
    localStorage.setItem('cafe_token', data.token);
    localStorage.setItem('cafe_user', JSON.stringify(data.user));
    return data.user;
  },
  
  logout: () => {
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('cafe_user');
    window.location.reload();
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('cafe_token');
    const res = await fetch(`/api/upload`, { 
      method: 'POST', 
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getProducts: () => request('/products'),
  saveProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/categories'),
  saveCategory: (cat) => request('/categories', { method: 'POST', body: JSON.stringify(cat) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getStock: () => request('/stock'),
  saveStockItem: (item) => request('/stock', { method: 'POST', body: JSON.stringify(item) }),
  deleteStockItem: (id) => request(`/stock/${id}`, { method: 'DELETE' }),

  getExpenses: () => request('/expenses'),
  getArchivedExpenses: () => request('/expenses/archived'),
  saveExpense: (exp) => request('/expenses', { method: 'POST', body: JSON.stringify(exp) }),
  archiveExpense: (id) => request(`/expenses/${id}/archive`, { method: 'POST' }),
  unarchiveExpense: (id) => request(`/expenses/${id}/unarchive`, { method: 'POST' }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/users'),
  saveUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getOrders: () => request('/orders'),
  getArchivedOrders: () => request('/orders/archived'),
  createOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  saveOrder: (order) => request('/orders/update', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  updateOrderPayment: (id, status) => request(`/orders/${id}/payment`, { method: 'POST', body: JSON.stringify({ status }) }),
  archiveOrder: (id) => request(`/orders/${id}/archive`, { method: 'POST' }),
  unarchiveOrder: (id) => request(`/orders/${id}/unarchive`, { method: 'POST' }),
  archiveOrders: (ids) => request('/orders/bulk-archive', { method: 'POST', body: JSON.stringify({ ids }) }),
  archiveAllOrders: () => request('/orders/archive-all', { method: 'POST' }),
  clearOrders: () => request('/orders/clear', { method: 'DELETE' }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  
  getStats: (timeframe) => request(`/stats?timeframe=${timeframe}`),
  getSettings: () => request('/settings'),
  saveSettings: (settings) => request('/settings', { method: 'POST', body: JSON.stringify(settings) }),

  getLogs: () => request('/logs'),
  clearLogs: () => request('/logs/clear', { method: 'DELETE' }),
};