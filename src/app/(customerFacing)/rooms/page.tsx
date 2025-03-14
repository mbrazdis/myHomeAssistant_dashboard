"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { addRoom, getRooms } from "../actions/rooms";
import { RoomCard } from '@/components/custom/RoomCard';
import { SidebarCard } from '@/components/custom/SidebarCard';
import CreateRoomModal from "./_components/CreateRoomModal";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { EnergyConsumption } from '@/components/custom/EnergyConsumption';
import { Plug } from "lucide-react";

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
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { deviceStatuses } = useWebSocket();

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

  // Create menuItems for SidebarCard
  const menuItems = rooms.map(room => ({
    title: room.name,
    description: `${room.devices.length} devices`,
    icon: <Plug className="h-4 w-4" />,
    onClick: () => setActiveRoomId(room.id === activeRoomId ? null : room.id),
    active: room.id === activeRoomId
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Room</Button>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <SidebarCard 
            title="Rooms" 
            className="sticky top-4"
          >
            {rooms.map(room => (
              <div 
                key={`menu-${room.id}`}
                className={`p-2 rounded cursor-pointer mb-2 ${room.id === activeRoomId ? 'bg-black/40' : 'hover:bg-black/20'}`}
                onClick={() => setActiveRoomId(room.id === activeRoomId ? null : room.id)}
              >
                <div className="flex items-center">
                  <Plug className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium text-white">{room.name}</div>
                    <div className="text-xs text-gray-400">{room.devices.length} devices</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <EnergyConsumption />
            </div>
          </SidebarCard>
        </div>
        
        {/* Room cards */}
        <div className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={`card-${room.id}`}
                room={room}
                isActive={room.id === activeRoomId}
                onClick={() => setActiveRoomId(room.id === activeRoomId ? null : room.id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* <CreateRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      /> */}
    </div>
  );
}