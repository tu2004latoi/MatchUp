import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { websocketService } from '../services/websocketService';
import type { WebSocketMessage, SendMessagePayload } from '../services/websocketService';

type WebSocketContextType = {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (payload: SendMessagePayload) => void;
  subscribeToRoom: (roomId: number, callback: (message: WebSocketMessage) => void) => void;
  unsubscribeFromRoom: (roomId: number) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

type WebSocketProviderProps = {
  children: ReactNode;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Auto-connect when provider mounts
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Listen for connection changes
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    websocketService.onConnectionChange(handleConnectionChange);

    // Cleanup on unmount
    return () => {
      websocketService.removeConnectionCallback(handleConnectionChange);
      websocketService.disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      await websocketService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      throw error;
    }
  };

  const disconnect = () => {
    websocketService.disconnect();
    setIsConnected(false);
  };

  const sendMessage = (payload: SendMessagePayload) => {
    websocketService.sendMessage(payload);
  };

  const subscribeToRoom = (roomId: number, callback: (message: WebSocketMessage) => void) => {
    websocketService.subscribeToRoom(roomId, callback);
  };

  const unsubscribeFromRoom = (roomId: number) => {
    websocketService.unsubscribeFromRoom(roomId);
  };

  const value: WebSocketContextType = {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    subscribeToRoom,
    unsubscribeFromRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
