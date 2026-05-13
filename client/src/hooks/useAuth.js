import { create } from 'zustand';
import api from '../services/api';

const useAuth = create((set) => ({
  user: null,
  token: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, token, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data.user;
  },

  register: async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/login';
  }
}));

export default useAuth;
