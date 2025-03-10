import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from '@/components/ColorPicker';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import * as deviceApi from '@/services/deviceApi';
import { debounce } from 'lodash';
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

export function LightController({ room }: { room: Room }) {
  const [activeTab, setActiveTab] = useState<string>("color");
  const [isLoading, setIsLoading] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [temperature, setTemperature] = useState(4750);
  const { refreshDeviceStatuses } = useWebSocket();

  // Debounced handlers
  const debouncedSetBrightness = useMemo(() => 
    debounce(async (value: number, deviceIds: string[]) => {
      try {
        await deviceApi.setBrightnessMultiple(deviceIds, value);
        await refreshDeviceStatuses();
      } catch (error) {
        console.error('Error setting brightness:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  [refreshDeviceStatuses]);

  const debouncedSetTemperature = useMemo(() => 
    debounce(async (value: number, deviceIds: string[]) => {
      try {
        await deviceApi.setTemperatureMultiple(deviceIds, value);
        await refreshDeviceStatuses();
      } catch (error) {
        console.error('Error setting temperature:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  [refreshDeviceStatuses]);

  const handleBrightnessChange = (value: number[]) => {
    setIsLoading(true);
    setBrightness(value[0]);
    const deviceIds = room.devices.map(device => device.id);
    debouncedSetBrightness(value[0], deviceIds);
  };

  const handleTemperatureChange = (value: number[]) => {
    setIsLoading(true);
    setTemperature(value[0]);
    const deviceIds = room.devices.map(device => device.id);
    debouncedSetTemperature(value[0], deviceIds);
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    const deviceIds = room.devices.map(device => device.id);
    
    try {
      setIsLoading(true);
      
      // Când schimbăm în modul white, aplicăm setările implicite pentru white
      if (value === "white") {
        // Folosește valoarea white în intervalul 0-100, nu 0-255
        await deviceApi.setWhiteMultiple(deviceIds, 100, 80); // 100% white, 80% gain
        // Actualizăm valorile slider-ilor
        setBrightness(100);
        setTemperature(4750);
      }
      
      await refreshDeviceStatuses();
    } catch (error) {
      console.error('Error changing light mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="white">White</TabsTrigger>
        </TabsList>
        <TabsContent value="color" className="flex justify-center mt-4">
          <ColorPicker room={room} />
        </TabsContent>
        <TabsContent value="white" className="mt-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="brightness">Brightness</Label>
                <span className="text-sm text-muted-foreground">{brightness}%</span>
              </div>
              <Slider
                id="brightness"
                min={1}
                max={100}
                step={1}
                value={[brightness]}
                onValueChange={handleBrightnessChange}
                disabled={isLoading}
                aria-label="Brightness"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature}K</span>
              </div>
              <Slider
                id="temperature"
                min={3000}
                max={6500}
                step={100}
                value={[temperature]}
                onValueChange={handleTemperatureChange}
                disabled={isLoading}
                aria-label="Temperature"
                className="gradient-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Warm</span>
                <span>Cool</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LightController;