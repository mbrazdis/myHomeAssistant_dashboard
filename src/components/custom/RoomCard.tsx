// src/components/custom/RoomCard.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Power, Lightbulb, Palette, Sun, 
  RefreshCw, Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { cn } from "@/lib/utils";
import * as deviceApi from '@/services/deviceApi';
import useLongPress from '@/hooks/useLongPress';

interface Device {
  id: string;
  name: string;
  roomId: string | null;
}

interface Room {
  id: string;
  name: string;
  devices: Device[];
}

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function RoomCard({ 
  room, 
  onClick, 
  isActive = false,
  className = "",
}: RoomCardProps) {
  const { deviceStatuses, updateDeviceStatus, refreshDeviceStatuses } = useWebSocket();
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determină starea dispozitivelor din cameră
  const areAllDevicesOn = room.devices.length > 0 && 
    room.devices.every(device => deviceStatuses[device.id]?.state === 'on');
  
  // Calculează puterea totală consumată
  const totalPower = room.devices.reduce((sum, device) => {
    return sum + (deviceStatuses[device.id]?.power || 0);
  }, 0);
  
  // Handler pentru click normal
  const handleClick = () => {
    if (onClick && !showControls) onClick();
  };
  
  // Handler pentru apăsare lungă
  const handleLongPress = () => {
    console.log("Long press detected!");
    setShowControls(true);
  };
  
  // Referință la componenta card
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handler pentru click-uri în afara componentei
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Închide controlul când se face click în afara lui
      if (showControls) {
        const controlElement = document.getElementById(`room-control-${room.id}`);
        if (controlElement && !controlElement.contains(event.target as Node)) {
          setShowControls(false);
        }
      }
    };
    
    // Adaugă event listener pentru document
    if (showControls) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Curăță event listener-ul
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showControls, room.id]);
  
  // Toggle pentru pornire/oprire dispozitive
  const handleTogglePower = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      setIsLoading(true);
      
      const deviceIds = room.devices.map(device => device.id);
      
      // Optimistic update
      const newState = areAllDevicesOn ? 'off' : 'on';
      deviceIds.forEach(id => {
        updateDeviceStatus(id, {
          state: newState,
          power: newState === 'on' ? 7.5 : 0
        });
      });
      
      // Call API
      if (deviceIds.length > 0) {
        try {
          if (areAllDevicesOn) {
            await deviceApi.turnOffMultiple(deviceIds);
          } else {
            await deviceApi.turnOnMultiple(deviceIds);
          }
          
          await refreshDeviceStatuses();
        } catch (apiError) {
          console.error('API Error:', apiError);
          await refreshDeviceStatuses();
        }
      }
    } catch (error) {
      console.error('General error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Setup long press event handlers
  const longPressHandlers = useLongPress(
    handleLongPress,
    handleClick
  );

  // Extract onMouseLeave from longPressHandlers to avoid duplication
  const { onMouseLeave: longPressMouseLeave, ...otherLongPressHandlers } = longPressHandlers;
  
  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
          "relative h-24 rounded-lg overflow-hidden transition-all duration-300",
          "backdrop-blur-sm",
          isHovered ? "bg-black/30" : "bg-black/20",
          isActive && "ring-2 ring-blue-500/50",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={(e) => {
          setIsHovered(false);
          // Call the original handler from longPressHandlers if it exists
          longPressMouseLeave?.(e);
        }}
        {...otherLongPressHandlers}
      >
        {/* Status indicator */}
        <div className={cn(
          "absolute top-0 left-0 h-full w-1",
          areAllDevicesOn ? "bg-green-500" : "bg-gray-500"
        )} />
        
        {/* Main content */}
        <div className="p-4 pl-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-white">
                {room.name}
              </h3>
              <p className="text-xs text-gray-300">
                {room.devices.length} devices
              </p>
            </div>
            
            {/* Power indicator */}
            {room.devices.length > 0 && totalPower > 0 && (
              <div className="text-xs text-gray-300">
                {totalPower.toFixed(1)} W
              </div>
            )}
          </div>
          
          {/* Bottom part */}
          <div className="flex justify-end">
            <Power 
              className={cn(
                "h-4 w-4 transition-colors",
                areAllDevicesOn ? "text-green-400" : "text-gray-400"
              )}
            />
          </div>
        </div>
      </div>
      
      {/* Modal pentru controale - folosim portal pentru a-l afișa peste tot conținutul */}
      {showControls && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowControls(false);
          }}
        >
          <div 
            id={`room-control-${room.id}`}
            className="bg-[#1B1C1D] border border-[#3B3B3A] rounded-lg shadow-xl w-80 p-4"
            onClick={(e) => e.stopPropagation()} // Previne închiderea la click în interior
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-white">{room.name}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowControls(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-3 text-sm text-gray-400">
              <p>{room.devices.length} devices • {totalPower.toFixed(1)} W</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button 
                variant="ghost" 
                className={cn(
                  "flex flex-col items-center p-3 h-auto rounded-lg",
                  areAllDevicesOn ? "bg-green-500/30 text-white" : "bg-black/30 text-gray-400"
                )}
                onClick={handleTogglePower}
                disabled={isLoading}
              >
                <Power className="h-5 w-5 mb-1" />
                <span className="text-xs">{areAllDevicesOn ? 'Turn Off' : 'Turn On'}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center p-3 h-auto rounded-lg bg-yellow-500/10 text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open light controller modal or functionality
                }}
              >
                <Lightbulb className="h-5 w-5 mb-1" />
                <span className="text-xs">Lights</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center p-3 h-auto rounded-lg bg-purple-500/10 text-purple-400" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Open color picker
                }}
              >
                <Palette className="h-5 w-5 mb-1" />
                <span className="text-xs">Color</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center p-3 h-auto rounded-lg bg-blue-500/10 text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open brightness control
                }}
              >
                <Sun className="h-5 w-5 mb-1" />
                <span className="text-xs">Brightness</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center p-3 h-auto rounded-lg bg-orange-500/10 text-orange-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open temperature control
                }}
              >
                <Thermometer className="h-5 w-5 mb-1" />
                <span className="text-xs">Temperature</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center p-3 h-auto rounded-lg bg-cyan-500/10 text-cyan-400"
                onClick={(e) => {
                  e.stopPropagation();
                  refreshDeviceStatuses();
                  setShowControls(false);
                }}
              >
                <RefreshCw className="h-5 w-5 mb-1" />
                <span className="text-xs">Refresh</span>
              </Button>
            </div>
            
            <div className="mt-5 text-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowControls(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}w