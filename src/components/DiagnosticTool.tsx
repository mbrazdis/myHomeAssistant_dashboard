// src/components/DiagnosticTool.tsx
"use client";

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function DiagnosticTool() {
  const [lastError, setLastError] = useState<string | null>(null);
  const { isConnected } = useWebSocket();

  // Capturează erorile
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      setLastError(errorMessage);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Asigură-te că este renderizat doar pe client
  if (typeof window === 'undefined') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded max-w-md max-h-48 overflow-auto text-xs">
      <h4 className="font-bold">Diagnostics</h4>
      <div>WebSocket: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
      {lastError && (
        <div className="mt-2">
          <div className="font-bold text-red-400">Last Error:</div>
          <div className="text-red-300 whitespace-pre-wrap">{lastError}</div>
        </div>
      )}
    </div>
  );
}