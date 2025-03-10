// src/contexts/DebugPanel.tsx - componentă nouă pentru debug
"use client";

import { useWebSocket } from './WebSocketContext';
import { useState, useEffect } from 'react';

export const DebugPanel = () => {
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { deviceStatuses, isConnected, refreshDeviceStatuses } = useWebSocket();
  const [wsError, setWsError] = useState<string | null>(null);
  const [backupMode, setBackupMode] = useState(false);

  // Actualizează timpul de refresh
  useEffect(() => {
    setLastRefreshTime(Date.now());
  }, [deviceStatuses]);
  
  // Doar pentru Next.js, asigură-te că rulează doar pe client
  if (typeof window === 'undefined') {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-50">
      <h4 className="font-bold">Device Connection</h4>
      <div>Mode: {backupMode ? 'API Polling' : 'WebSocket'}</div>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Devices: {Object.keys(deviceStatuses).length}</div>
      <div>Last Refresh: {new Date(lastRefreshTime).toLocaleTimeString()}</div>
      <button
        onClick={() => refreshDeviceStatuses()}
        className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
      >
        Refresh Now
      </button>
      {wsError && <div className="text-red-400 mt-1">{wsError}</div>}
    </div>
  );
};