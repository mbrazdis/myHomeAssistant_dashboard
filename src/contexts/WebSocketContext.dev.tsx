// src/contexts/WebSocketContext.dev.tsx
// Versiune pentru dezvoltare cu mock data și fără conexiune WebSocket
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DeviceColor {
  r: number;
  g: number;
  b: number;
}

// Define proper types for the device status
interface DeviceStatus {
  state: 'on' | 'off';
  color: DeviceColor;
  power: number;
  energy: number;
}

interface WebSocketContextValue {
  deviceStatuses: Record<string, DeviceStatus>;
  isConnected: boolean;
  updateDeviceStatus: (deviceId: string, status: Partial<DeviceStatus>) => void;
  refreshDeviceStatuses: () => void;
}

// Create context with default value
const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

// Create a hook for using the context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Mock devices for development
const mockDevices: Record<string, DeviceStatus> = {
  "shellycolorbulb-34945479BCE1": {
    state: 'on' as const,
    color: { r: 255, g: 0, b: 0 },
    power: 7.5,
    energy: 124.5
  },
  "shellycolorbulb-485519D9B1C8": {
    state: 'on' as const,
    color: { r: 100, g: 200, b: 255 },
    power: 6.8,
    energy: 85.2
  },
  "shellycolorbulb-34945479BD46": {
    state: 'off' as const,
    color: { r: 255, g: 255, b: 255 },
    power: 0,
    energy: 42.1
  }
};

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>(mockDevices);
  const [isConnected] = useState(true); // Simulating connected status

  // Function to update a device's status
  const updateDeviceStatus = (deviceId: string, status: Partial<DeviceStatus>) => {
    setDeviceStatuses(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        ...status
      }
    }));
  };

  // Function to refresh all device statuses (simulate API call)
  const refreshDeviceStatuses = () => {
    // In a real app, this would make an API call
    console.log('Refreshing device statuses...');
    // No need to update anything as we're using mock data
  };

  // Simulăm mici variații aleatorii în consum pentru realism
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDeviceStatuses(prev => {
        const updated = {...prev};
        
        Object.keys(updated).forEach(deviceId => {
          if (updated[deviceId].state === 'on') {
            updated[deviceId] = {
              ...updated[deviceId],
              power: Number((updated[deviceId].power! + (Math.random() * 0.4 - 0.2)).toFixed(1)),
              energy: Number((updated[deviceId].energy! + 0.01).toFixed(2))
            };
          }
        });
        
        return updated;
      });
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <WebSocketContext.Provider value={{ 
      deviceStatuses, 
      isConnected, 
      updateDeviceStatus,
      refreshDeviceStatuses
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};