import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = localStorage.getItem('accessToken');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDashboard(dashboardId: number) {
    if (this.socket) {
      this.socket.emit('join:dashboard', dashboardId);
    }
  }

  leaveDashboard(dashboardId: number) {
    if (this.socket) {
      this.socket.emit('leave:dashboard', dashboardId);
    }
  }

  moveCursor(dashboardId: number, x: number, y: number) {
    if (this.socket) {
      this.socket.emit('cursor:move', { dashboardId, x, y });
    }
  }

  updateDashboard(dashboardId: number, data: any) {
    if (this.socket) {
      this.socket.emit('dashboard:update', { dashboardId, data });
    }
  }

  onUserJoin(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:join', callback);
    }
  }

  onUserLeave(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:leave', callback);
    }
  }

  onCursorMove(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('cursor:move', callback);
    }
  }

  onDashboardUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('dashboard:update', callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();