"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import * as deviceApi from '@/services/deviceApi';

interface Device {
    id: string;
    name: string;
}

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, devices: string[]) => void;
}

export default function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDevices();
        }
    }, [isOpen]);

    const loadDevices = async () => {
        try {
            setIsLoading(true);
            // Replace with your actual API call
            const response = await fetch('/api/devices');
            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error('Error loading devices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeviceToggle = (deviceId: string) => {
        setSelectedDevices(prev => 
            prev.includes(deviceId)
                ? prev.filter(id => id !== deviceId)
                : [...prev, deviceId]
        );
    };

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name, selectedDevices);
            setName('');
            setSelectedDevices([]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Room Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Living Room"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Select Devices</Label>
                        {isLoading ? (
                            <div>Loading devices...</div>
                        ) : (
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {devices.map((device) => (
                                    <div key={device.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`device-${device.id}`}
                                            checked={selectedDevices.includes(device.id)}
                                            onCheckedChange={() => handleDeviceToggle(device.id)}
                                        />
                                        <Label htmlFor={`device-${device.id}`}>{device.name}</Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Create Room
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}