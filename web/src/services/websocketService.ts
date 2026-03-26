// Polyfill for global object in browser environment
if (typeof (globalThis as any).global === 'undefined') {
  (window as any).global = window;
}

import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type WebSocketMessage = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  room: {
    id: number;
  };
};

export type SendMessagePayload = {
  roomId: number;
  content: string;
  senderId: number;
};

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connectionCallbacks: Array<(connected: boolean) => void> = [];
  private messageCallbacks: Map<number, Array<(message: WebSocketMessage) => void>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve();
        return;
      }

      // Create SockJS connection
      const socket = new SockJS('http://localhost:8080/ws');
      
      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Connection success
      this.client.onConnect = () => {
        console.log('WebSocket connected successfully');
        this.connectionCallbacks.forEach(callback => callback(true));
        resolve();
      };

      // Connection error
      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        this.connectionCallbacks.forEach(callback => callback(false));
        reject(new Error('WebSocket connection failed'));
      };

      // Disconnect
      this.client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        this.connectionCallbacks.forEach(callback => callback(false));
      };

      // Activate the client
      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions.clear();
      this.messageCallbacks.clear();
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  // Subscribe to room messages
  subscribeToRoom(roomId: number, callback: (message: WebSocketMessage) => void): void {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const topic = `/topic/room/${roomId}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
    }

    // Subscribe to new messages
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.body);
        console.log('Received message:', parsedMessage);
        
        // Call all callbacks for this room
        const callbacks = this.messageCallbacks.get(roomId) || [];
        callbacks.forEach(cb => cb(parsedMessage));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    
    // Store callback
    if (!this.messageCallbacks.has(roomId)) {
      this.messageCallbacks.set(roomId, []);
    }
    this.messageCallbacks.get(roomId)!.push(callback);
  }

  // Unsubscribe from room
  unsubscribeFromRoom(roomId: number): void {
    const topic = `/topic/room/${roomId}`;
    const subscription = this.subscriptions.get(topic);
    
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
    
    this.messageCallbacks.delete(roomId);
  }

  // Send message
  sendMessage(payload: SendMessagePayload): void {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(payload),
    });
  }

  // Add connection status callback
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  // Remove connection status callback
  removeConnectionCallback(callback: (connected: boolean) => void): void {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
