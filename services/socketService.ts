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
      // Join user's room on connect
      if (this.socket && this.userId) {
        this.socket.emit('join', this.userId);
      }
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

    const message = {
      senderId: this.userId,
      receiverId,
      content,
    };

    // Send message to server
    this.socket.emit('sendMessage', message);

    // Return the message for local state update
    return {
      ...message,
      createdAt: new Date(),
    };
  }

  onReceiveMessage(callback: (message: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      callback(message);
    });
  }

  removeReceiveMessageListener() {
    if (!this.socket) return;
    this.socket.off('receiveMessage');
  }

  // Add method to check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 