import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    this.userId = userId;
    this.socket = io('http://localhost:3001/chat', {
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(receiverId: string, content: string) {
    if (!this.socket || !this.userId) {
      console.error('Socket not connected or userId not set');
      return;
    }

    this.socket.emit('sendMessage', {
      senderId: this.userId,
      receiverId,
      content,
    });
  }

  onReceiveMessage(callback: (message: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('receiveMessage', callback);
  }

  removeReceiveMessageListener() {
    if (!this.socket) return;
    this.socket.off('receiveMessage');
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 