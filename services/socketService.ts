import { io, Socket } from 'socket.io-client';

interface CallEvents {
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit;
  iceCandidate: RTCIceCandidateInit;
  endCall: void;
  caller: {
    id: string;
    username: string;
    profilePicture: string;
  };
}

interface NotificationData {
  actor: string;
  userId: string;
  title: string;
  content: string;
  data: any;
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    this.userId = userId;
    console.log(`Attempting to connect socket for user: ${userId}`);
    
    this.socket = io('http://localhost:3001/chat', {
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server with socket ID:', this.socket?.id);
      // Join user's room on connect
      if (this.socket && this.userId) {
        this.socket.emit('join', this.userId);
        console.log(`Joined room for user: ${this.userId}`);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Disconnected from WebSocket server. Reason: ${reason}`);
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

  // Notification methods
  sendNotification(notification: NotificationData) {
    if (!this.socket || !this.userId) {
      console.error('Socket not connected or userId not set');
      return;
    }

    // Send notification to server
    this.socket.emit('sendNotification', notification);
  }

  onReceiveNotification(callback: (notification: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected when trying to set up notification listener');
      return;
    }

    this.socket.on('receiveNotification', (notification) => {
      console.log('Received notification:', notification);
      callback(notification);
    });
  }

  removeReceiveNotificationListener() {
    if (!this.socket) return;
    this.socket.off('receiveNotification');
  }

  // Add method to check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Call methods
  sendCallOffer(targetUserId: string, offer: RTCSessionDescriptionInit, caller: { id: string; username: string; profilePicture: string }) {
    if (!this.socket) return;
    this.socket.emit('call:offer', { targetUserId, offer, caller });
  }

  sendCallAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    if (!this.socket) return;
    this.socket.emit('call:answer', { targetUserId, answer });
  }

  sendIceCandidate(targetUserId: string, candidate: RTCIceCandidateInit) {
    if (!this.socket) return;
    this.socket.emit('call:ice-candidate', { targetUserId, candidate });
  }

  sendEndCall(targetUserId: string) {
    if (!this.socket) return;
    this.socket.emit('call:end', { targetUserId });
  }

  onCallOffer(callback: (offer: RTCSessionDescriptionInit, caller: { id: string; username: string; profilePicture: string }) => void) {
    if (!this.socket) return;
    this.socket.on('call:offer', ({ offer, caller }) => callback(offer, caller));
  }

  onCallAnswer(callback: (answer: RTCSessionDescriptionInit) => void) {
    if (!this.socket) return;
    this.socket.on('call:answer', ({ answer }) => callback(answer));
  }

  onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void) {
    if (!this.socket) return;
    this.socket.on('call:ice-candidate', ({ candidate }) => callback(candidate));
  }

  onEndCall(callback: () => void) {
    if (!this.socket) return;
    this.socket.on('call:end', callback);
  }

  removeListener(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 