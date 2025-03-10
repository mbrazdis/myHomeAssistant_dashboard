import React, { useState, useMemo, useEffect } from 'react';
import Wheel from '@uiw/react-color-wheel';
import { hsvaToRgba, HsvaColor, rgbaToHsva } from '@uiw/color-convert';
import { Button } from "@/components/ui/button";
import { debounce } from 'lodash';
import * as deviceApi from '@/services/deviceApi';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface Device {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  devices: Device[];
}

interface DeviceStatus {
  color?: RGB;
  red?: number;
  green?: number;
  blue?: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function ColorPicker({ room }: { room: Room }) {
  const [isLoading, setIsLoading] = useState(false);
  const { deviceStatuses, refreshDeviceStatuses } = useWebSocket();
  
  // Get current color from device status
  const currentColor = useMemo(() => {
    if (room.devices.length === 0) {
      return { r: 255, g: 255, b: 255 };
    }
    
    const firstDeviceId = room.devices[0].id;
    const deviceStatus = deviceStatuses[firstDeviceId];
    
    if (deviceStatus?.color) {
      return deviceStatus.color;
    } else if (deviceStatus?.red !== undefined && deviceStatus?.green !== undefined && deviceStatus?.blue !== undefined) {
      return {
        r: deviceStatus.red,
        g: deviceStatus.green,
        b: deviceStatus.blue
      };
    }
    
    return { r: 255, g: 255, b: 255 };
  }, [room.devices, deviceStatuses]);

  // Convert RGB to HSVA for color wheel
  const hsvaColor = useMemo(() => {
    return rgbaToHsva({
      r: currentColor.r,
      g: currentColor.g, 
      b: currentColor.b,
      a: 1
    });
  }, [currentColor]);

  // Debounced color change handler
  const debouncedSetColor = useMemo(() => 
    debounce(async (color: RGB, deviceIds: string[]) => {
      try {
        await deviceApi.setColorMultiple(deviceIds, color);
        await refreshDeviceStatuses();
      } catch (error) {
        console.error('Error setting color:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  [refreshDeviceStatuses]);

  const handleColorChange = (color: any) => {
    setIsLoading(true);
    
    const rgba = hsvaToRgba(color.hsva);
    const newColor = { 
      r: Math.round(rgba.r), 
      g: Math.round(rgba.g), 
      b: Math.round(rgba.b) 
    };
    
    const deviceIds = room.devices.map(device => device.id);
    debouncedSetColor(newColor, deviceIds);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Wheel
        color={hsvaColor}
        onChange={handleColorChange}
        width={200}
        height={200}
      />
    </div>
  );
}

export default ColorPicker;