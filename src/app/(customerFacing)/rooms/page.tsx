"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateRoomModal from "./_components/CreateRoomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plug, Power } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { addRoom, getRooms } from "../actions/rooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as deviceApi from "@/services/deviceApi";
import { cn } from "@/lib/utils"; 
import { ColorPicker } from "@/components/ColorPicker";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { LightControllerModal } from '@/components/LightControllerModal';


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

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getRooms();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = async (roomName: string, devices: string[]) => {
    try {
      const formData = new FormData();
      formData.append('name', roomName);
      devices.forEach(deviceId => {
        formData.append('devices', deviceId);
      });

      const result = await addRoom({}, formData);

      if (result.success) {
        setIsModalOpen(false);
        const updatedRooms = await getRooms();
        setRooms(updatedRooms);
      } else {
        console.error('Failed to create room:', result.error);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            Add Room
          </Button>
        </div>

        <CreateRoomModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRoom}
        />

        <RoomsTable rooms={rooms} />
      </div>
      
      
    </>
  );
}

function RoomsTable({ rooms }: { rooms: Room[] }) {
  const { deviceStatuses } = useWebSocket();
  if (!rooms || rooms.length === 0) {
    return <p>No rooms available</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <Card key={room.id} className="bg-[#3B3B3A] text-[#9A9C9D] border-[#1B1C1D] shadow-md hover:shadow-lg transition-shadow relative">
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-[#FF5733] hover:text-white p-2 rounded">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={`/rooms/${room.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/rooms/${room.id}/devices`}>Manage Devices</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {room.devices.length > 0 ? (
                    <Plug className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  <span>{room.devices.length} devices</span>
                </div>
                <div className="flex items-center space-x-2">
                  {room.devices.length > 0 && <PowerButton room={room} />}
                  {room.devices.length > 0 && <LightControllerModal room={room} areAllDevicesOn={room.devices.every(
                    device => deviceStatuses[device.id]?.state === 'on'
                  )} />}
                </div>
              </div>
              
              {room.devices.length > 0 && (
                <>
                  
                  
                  <EnergyConsumption room={room} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// În page.tsx - actualizează PowerButton
function PowerButton({ room }: { room: Room }) {
  const [isLoading, setIsLoading] = useState(false);
  const { deviceStatuses, updateDeviceStatus, refreshDeviceStatuses } = useWebSocket();
  
  // Determină dacă toate dispozitivele sunt pornite
  const areAllDevicesOn = useMemo(() => {
    if (room.devices.length === 0) return false;
    
    return room.devices.every(device => 
      deviceStatuses[device.id]?.state === 'on'
    );
  }, [room.devices, deviceStatuses]);

  // Reîmprospătează statusul dispozitivelor când componenta se încarcă
  useEffect(() => {
    refreshDeviceStatuses();
  }, [refreshDeviceStatuses]);

  useEffect(() => {
    if (room.devices.length > 0) {
      console.log('Room:', room.name);
      console.log('Devices:', room.devices.map(d => d.id));
      console.log('Current statuses:', room.devices.map(d => ({
        id: d.id,
        state: deviceStatuses[d.id]?.state || 'unknown'
      })));
      console.log('All devices ON?', areAllDevicesOn);
    }
  }, [room, deviceStatuses, areAllDevicesOn]);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      
      const deviceIds = room.devices.map(device => device.id);
      console.log('Toggling devices:', deviceIds);
      console.log('Current state:', areAllDevicesOn ? 'ON -> OFF' : 'OFF -> ON');
      
      // Optimistic update
      const newState = areAllDevicesOn ? 'off' : 'on';
      deviceIds.forEach(id => {
        updateDeviceStatus(id, {
          state: newState,
          power: newState === 'on' ? 7.5 : 0
        });
      });
      
      try {
        if (areAllDevicesOn) {
          await deviceApi.turnOffMultiple(deviceIds);
        } else {
          await deviceApi.turnOnMultiple(deviceIds);
        }
        
        // După apelul API, reîmprospătăm starea dispozitivelor pentru a avea datele corecte
        await refreshDeviceStatuses();
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Revenim la starea anterioară în caz de eroare
        await refreshDeviceStatuses();
      }
    } catch (error) {
      console.error('General error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-8 w-8",
        areAllDevicesOn ? "bg-green-500 hover:bg-green-600" : "",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Power className={cn("h-4 w-4", areAllDevicesOn ? "text-white" : "")} />
    </Button>
  );
}

function EnergyConsumption({ room }: { room: Room }) {
  const { deviceStatuses } = useWebSocket();
  
  // Calculăm consumul total de energie pentru cameră
  const totalPower = useMemo(() => {
    return room.devices.reduce((sum, device) => {
      const power = deviceStatuses[device.id]?.power || 0;
      return sum + power;
    }, 0);
  }, [room.devices, deviceStatuses]);

  const totalEnergy = useMemo(() => {
    return room.devices.reduce((sum, device) => {
      const energy = deviceStatuses[device.id]?.energy || 0;
      return sum + energy;
    }, 0);
  }, [room.devices, deviceStatuses]);

  return (
    <div className="mt-2 text-sm">
      <div className="flex justify-between items-center">
        <span>Consum curent:</span>
        <span className="font-medium">{totalPower.toFixed(1)} W</span>
      </div>
      <div className="flex justify-between items-center">
        <span>Energie totală:</span>
        <span className="font-medium">{totalEnergy.toFixed(2)} kWh</span>
      </div>
    </div>
  );
}