import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  login: async (username, password) => {
    const { data } = await axios.post('/api/auth/login', { username, password });
    localStorage.setItem('user', JSON.stringify(data));
    // Set axios default auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    set({ user: data });
  },
  logout: () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null });
  }
}));

export default useAuthStore;
