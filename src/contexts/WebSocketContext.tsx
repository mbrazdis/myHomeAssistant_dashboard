// src/contexts/WebSocketContext.tsx - versiunea corectată
"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as deviceApi from '@/services/deviceApi';

interface DeviceColor {
  r: number;
  g: number;
  b: number;
}

export interface DeviceStatus {
  state: 'on' | 'off';
  color?: {
    r: number;
    g: number;
    b: number;
  };
  power?: number;
  energy?: number;
  brightness?: number;
  temperature?: number;
  mode?: 'color' | 'white';
  red?: number;
  green?: number;
  blue?: number;
}

interface WebSocketContextValue {
  deviceStatuses: Record<string, DeviceStatus>;
  isConnected: boolean;
  updateDeviceStatus: (deviceId: string, status: Partial<DeviceStatus>) => void;
  refreshDeviceStatuses: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  deviceStatuses: {},
  isConnected: false,
  updateDeviceStatus: () => {},
  refreshDeviceStatuses: async () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

// OPȚIUNI DE CONFIGURARE - modifică aceste valori pentru a controla comportamentul
const CONFIG = {
  USE_WEBSOCKET: true,              // Activează/dezactivează WebSocket
  WEBSOCKET_MAX_RETRIES: 3,         // Numărul maxim de încercări înainte de a trece la API polling
  POLLING_INTERVAL: 5000,           // Intervalul pentru polling API în ms
  REFRESH_MIN_INTERVAL: 2000,       // Intervalul minim între refresh-uri manuale
  SHOW_DEBUG_PANEL: true,           // Afișează panoul de debug
  SUPPRESS_WEBSOCKET_ERRORS: true,  // Suprimă erorile WebSocket din consolă
  LOG_LEVEL: 'info'                 // 'debug', 'info', 'warn', 'error'
};

import { DebugPanel } from './DebugPanel';

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [wsRetryCount, setWsRetryCount] = useState(0);
  const [backupMode, setBackupMode] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  
  // Refs pentru a preveni apelurile duplicate
  const lastRefreshTime = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const originalConsoleError = useRef<typeof console.error | null>(null);

  // Suprimare erori inutile de consolă
  useEffect(() => {
    if (CONFIG.SUPPRESS_WEBSOCKET_ERRORS) {
      // Salvăm funcția originală
      originalConsoleError.current = console.error;
      
      // Înlocuim funcția pentru a filtra erorile legate de WebSocket
      console.error = function(...args) {
        const errorMsg = args.join(' ');
        
        // Filtrăm erorile legate de WebSocket și 404
        if (
          errorMsg.includes('WebSocket') ||
          errorMsg.includes('status code 404') ||
          errorMsg.includes('API Error [404]')
        ) {
          // Înlocuim cu un log mai puțin invaziv
          console.log('[Filtered]', ...args);
          return;
        }
        
        // Apelăm funcția originală pentru celelalte erori
        if (originalConsoleError.current) {
          originalConsoleError.current.apply(console, args);
        }
      };
    }
    
    // Cleanup
    return () => {
      if (originalConsoleError.current) {
        console.error = originalConsoleError.current;
      }
    };
  }, []);

  // Custom logging function
  const log = (level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) => {
    const levelMap = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    const configLevelValue = levelMap[CONFIG.LOG_LEVEL as keyof typeof levelMap] || 1;
    const msgLevelValue = levelMap[level];
    
    if (msgLevelValue >= configLevelValue) {
      const prefix = `[${level.toUpperCase()}]`;
      switch (level) {
        case 'debug': console.debug(prefix, ...args); break;
        case 'info': console.log(prefix, ...args); break;
        case 'warn': console.warn(prefix, ...args); break;
        case 'error': console.error(prefix, ...args); break;
      }
    }
  };

  // Function to update a device's status
  const updateDeviceStatus = (deviceId: string, status: Partial<DeviceStatus>) => {
    setDeviceStatuses(prev => {
      // Create the device if it doesn't exist
      const existingDevice = prev[deviceId] || {
        state: 'off',
        color: { r: 255, g: 255, b: 255 },
        power: 0,
        energy: 0
      };
      
      return {
        ...prev,
        [deviceId]: {
          ...existingDevice,
          ...status
        }
      };
    });
  };

  // Function to refresh all device statuses
  const refreshDeviceStatuses = async () => {
    // Evităm apeluri prea frecvente
    const now = Date.now();
    if (now - lastRefreshTime.current < CONFIG.REFRESH_MIN_INTERVAL || isRefreshing.current) {
      log('debug', 'Skipping refresh - too soon or already refreshing');
      return;
    }
    
    lastRefreshTime.current = now;
    isRefreshing.current = true;
    
    try {
      log('info', 'Requesting device status update');
      
      // Dacă suntem conectați la WebSocket, trimitem o cerere de actualizare
      if (isConnected && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        log('debug', 'Requesting status update via WebSocket');
        socketRef.current.send(JSON.stringify({
          type: "request_status"
        }));
      } else {
        // Altfel folosim API-ul HTTP
        log('info', 'Requesting status update via HTTP API');
        const deviceData = await deviceApi.getDevicesStatus()
          .catch(() => {
            log('warn', 'Failed to get device status, using empty dataset');
            return {};
          });
        
        // Procesăm datele venite de la API
        Object.entries(deviceData).forEach(([deviceId, device]: [string, any]) => {
          updateDeviceStatus(deviceId, {
            state: device.ison ? 'on' : 'off',
            color: {
              r: device.red || 255,
              g: device.green || 255,
              b: device.blue || 255
            },
            power: device.power || 0,
            energy: device.energy || 0,
            brightness: device.brightness || 100,
            temperature: device.temp || 4750,
            mode: device.mode || 'color',
          });
        });
      }
    } catch (error) {
      log('warn', 'Failed to refresh device statuses, will try again later');
    } finally {
      isRefreshing.current = false;
    }
  };

  // WebSocket connection logic
  useEffect(() => {
    // Skip WebSocket setup if disabled
    if (!CONFIG.USE_WEBSOCKET) {
      log('info', 'WebSocket disabled in config');
      setBackupMode(true);
      return;
    }
    
    // If too many retries, switch to backup mode
    if (wsRetryCount > CONFIG.WEBSOCKET_MAX_RETRIES) {
      log('info', 'Too many WebSocket connection attempts, switching to backup mode');
      setBackupMode(true);
      return;
    }
    
    const setupWebSocket = () => {
      try {
        // Încărcăm starea inițială
        refreshDeviceStatuses();
        
        // Configurare WebSocket
        const host = window.location.hostname;
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const WS_URL = `${wsProtocol}//${host}:8000/ws`;
        
        log('info', `Connecting to WebSocket at ${WS_URL}...`);
        setWsError(null);
        
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;
        
        socket.onopen = () => {
          log('info', 'WebSocket connected successfully!');
          setIsConnected(true);
          setBackupMode(false);
          setWsRetryCount(0);
        };
        
        socket.onmessage = (event) => {
          try {
            // Evităm logging excesiv
            log('debug', 'WebSocket message received');
            
            // Parsăm datele JSON
            const data = JSON.parse(event.data);
            
            // Procesăm mesajele în funcție de tipul lor
            switch (data.type) {
              case 'initial_devices':
                // Actualizăm cu datele inițiale primite de la server
                log('info', 'Received initial device status data');
                if (Array.isArray(data.data)) {
                  data.data.forEach((device: any) => {
                    if (device.device_id) {
                      updateDeviceStatus(device.device_id, {
                        state: device.ison ? 'on' : 'off',
                        color: {
                          r: device.red || 255,
                          g: device.green || 255,
                          b: device.blue || 255
                        },
                        power: device.power || 0,
                        energy: device.energy || 0,
                        brightness: device.brightness || 100,
                        temperature: device.temp || 4750,
                        mode: device.mode || 'color'
                      });
                    }
                  });
                }
                break;
                
              case 'devices_status':
                // Actualizăm cu datele de status primite de la server
                log('info', 'Received device status update');
                if (Array.isArray(data.data)) {
                  data.data.forEach((device: any) => {
                    if (device.device_id) {
                      updateDeviceStatus(device.device_id, {
                        state: device.ison ? 'on' : 'off',
                        color: {
                          r: device.red || 255,
                          g: device.green || 255,
                          b: device.blue || 255
                        },
                        power: device.power || 0,
                        energy: device.energy || 0,
                        brightness: device.brightness || 100,
                        temperature: device.temp || 4750,
                        mode: device.mode || 'color'
                      });
                    }
                  });
                }
                break;
                
              case 'device_update':
                // Actualizăm un singur dispozitiv
                if (data.device_id) {
                  log('debug', `Received update for device ${data.device_id}`);
                  updateDeviceStatus(data.device_id, {
                    state: data.ison ? 'on' : 'off',
                    color: {
                      r: data.red || 255,
                      g: data.green || 255,
                      b: data.blue || 255
                    },
                    power: data.power || 0,
                    energy: data.energy || 0,
                    brightness: data.brightness || 100,
                    temperature: data.temp || 4750,
                    mode: data.mode || 'color'
                  });
                }
                break;
                
              default:
                // Alte tipuri de mesaje
                log('debug', 'Received unknown message type:', data.type);
            }
          } catch (error) {
            log('warn', 'Error processing WebSocket message:', error);
          }
        };
        
        socket.onclose = (event) => {
          log('warn', `WebSocket disconnected: code=${event.code}, reason=${event.reason || 'No reason provided'}`);
          setIsConnected(false);
          socketRef.current = null;
          
          // Retry cu backoff exponențial
          const delay = Math.min(1000 * Math.pow(2, wsRetryCount), 30000);
          log('info', `Retrying WebSocket connection in ${delay/1000} seconds...`);
          
          setTimeout(() => {
            setWsRetryCount(prev => prev + 1);
          }, delay);
        };
        
        socket.onerror = (error) => {
          // Nu mai afișăm eroarea în consolă - gestionăm mai elegant
          log('warn', 'WebSocket error occurred');
          setWsError('WebSocket connection error');
        };
        
        return () => {
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            log('info', 'Closing WebSocket connection');
            socket.close();
          }
          socketRef.current = null;
        };
      } catch (error) {
        log('warn', 'Error setting up WebSocket');
        
        // Activăm modul backup
        setBackupMode(true);
        return () => {};
      }
    };
    
    const cleanup = setupWebSocket();
    return cleanup;
  }, [wsRetryCount]);

  // Polling API în modul backup
  useEffect(() => {
    if (backupMode) {
      log('info', 'Running in backup mode - polling API periodically');
      
      // Refresh imediat când intrăm în modul backup
      refreshDeviceStatuses();
      
      // Polling la intervalul configurat
      const intervalId = setInterval(() => {
        log('debug', 'Polling API for device status updates');
        refreshDeviceStatuses();
      }, CONFIG.POLLING_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [backupMode]);

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