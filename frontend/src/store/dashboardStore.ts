import { create } from 'zustand';
import api from '../services/api';
import { Dashboard } from '../types';

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboards: () => Promise<void>;
  fetchDashboard: (id: number) => Promise<void>;
  createDashboard: (name: string, config?: any) => Promise<void>;
  updateDashboard: (id: number, updates: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  currentDashboard: null,
  isLoading: false,
  error: null,

  fetchDashboards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboards');
      set({ dashboards: response.data.dashboards, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch dashboards',
        isLoading: false,
      });
    }
  },

  fetchDashboard: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/dashboards/${id}`);
      set({ currentDashboard: response.data.dashboard, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch dashboard',
        isLoading: false,
      });
    }
  },

  createDashboard: async (name: string, config?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/dashboards', { name, config });
      set((state) => ({
        dashboards: [...state.dashboards, response.data.dashboard],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  updateDashboard: async (id: number, updates: Partial<Dashboard>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/dashboards/${id}`, updates);
      set((state) => ({
        dashboards: state.dashboards.map((d) =>
          d.id === id ? response.data.dashboard : d
        ),
        currentDashboard:
          state.currentDashboard?.id === id
            ? response.data.dashboard
            : state.currentDashboard,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDashboard: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/dashboards/${id}`);
      set((state) => ({
        dashboards: state.dashboards.filter((d) => d.id !== id),
        currentDashboard:
          state.currentDashboard?.id === id ? null : state.currentDashboard,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete dashboard',
        isLoading: false,
      });
      throw error;
    }
  },
}));