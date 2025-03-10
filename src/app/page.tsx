"use client";

import React, { useEffect, useState } from "react";
import api from "../utils/api";
import DeviceCard from "../components/DeviceCard";
import { Device } from "../types/Device";

export default function HomePage() {
  const [devices, setDevices] = useState<Device[]>([]);

  const fetchDevices = async () => {
    try {
      const response = await api.get("/devices");
      console.log("Devices fetched:", response.data); 
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const toggleDevice = async (device: Device) => {
    try {
      const newStatus = device.ison ? "off" : "on";
      await api.post(`/devices/${device.device_id}/${newStatus}`);
      fetchDevices(); 
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  useEffect(() => {
    fetchDevices();

    const interval = setInterval(() => {
      fetchDevices(); 
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {devices.map((device) => (
        <DeviceCard
          key={device.device_id}
          device={device} 
          onToggle={() => toggleDevice(device)}
        />
      ))}
    </div>
  );
}
