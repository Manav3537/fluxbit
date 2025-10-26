import { create } from 'zustand';
import api from '../services/api';
import { Annotation } from '../types';

interface AnnotationState {
  annotations: Annotation[];
  isLoading: boolean;
  error: string | null;
  fetchAnnotations: (dashboardId: number) => Promise<void>;
  createAnnotation: (dashboardId: number, content: string, xPos: number, yPos: number) => Promise<void>;
  deleteAnnotation: (id: number) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  annotations: [],
  isLoading: false,
  error: null,

  fetchAnnotations: async (dashboardId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/annotations/${dashboardId}`);
      set({ annotations: response.data.annotations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch annotations',
        isLoading: false,
      });
    }
  },

  createAnnotation: async (dashboardId: number, content: string, xPos: number, yPos: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/annotations', {
        dashboardId,
        content,
        xPos,
        yPos,
      });
      set((state) => ({
        annotations: [...state.annotations, response.data.annotation],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create annotation',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAnnotation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/annotations/${id}`);
      set((state) => ({
        annotations: state.annotations.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete annotation',
        isLoading: false,
      });
      throw error;
    }
  },
}));