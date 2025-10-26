import { create } from 'zustand';

interface Cursor {
  socketId: string;
  x: number;
  y: number;
}

interface CollaborationState {
  connectedUsers: Set<string>;
  cursors: Map<string, Cursor>;
  addUser: (socketId: string) => void;
  removeUser: (socketId: string) => void;
  updateCursor: (socketId: string, x: number, y: number) => void;
  removeCursor: (socketId: string) => void;
  reset: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  connectedUsers: new Set(),
  cursors: new Map(),

  addUser: (socketId: string) => {
    set((state) => {
      const newUsers = new Set(state.connectedUsers);
      newUsers.add(socketId);
      return { connectedUsers: newUsers };
    });
  },

  removeUser: (socketId: string) => {
    set((state) => {
      const newUsers = new Set(state.connectedUsers);
      newUsers.delete(socketId);
      const newCursors = new Map(state.cursors);
      newCursors.delete(socketId);
      return { connectedUsers: newUsers, cursors: newCursors };
    });
  },

  updateCursor: (socketId: string, x: number, y: number) => {
    set((state) => {
      const newCursors = new Map(state.cursors);
      newCursors.set(socketId, { socketId, x, y });
      return { cursors: newCursors };
    });
  },

  removeCursor: (socketId: string) => {
    set((state) => {
      const newCursors = new Map(state.cursors);
      newCursors.delete(socketId);
      return { cursors: newCursors };
    });
  },

  reset: () => {
    set({ connectedUsers: new Set(), cursors: new Map() });
  },
}));