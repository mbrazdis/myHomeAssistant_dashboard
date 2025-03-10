"use client";

import React, { useState, useEffect } from "react";
import AddDeviceForm from "../../../components/AddDeviceForm";
import EditDeviceForm from "../../../components/EditDeviceForm"; 
import api from "../../../utils/api"; 

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);


  const fetchDevices = async () => {
    try {
      const response = await api.get("/devices");
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleDeviceAdded = () => {
    fetchDevices(); 
  };


  const handleDeviceUpdated = () => {
    fetchDevices();  
    setEditingDevice(null);  
  };


  const handleEditDevice = (device: any) => {
    setEditingDevice(device); 
  };

  useEffect(() => {
    fetchDevices();  
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Devices</h1>

      {/* Afișează formularul de adăugare sau de editare */}
      {/* {editingDevice ? (
        <EditDeviceForm device={editingDevice} onDeviceUpdated={handleDeviceUpdated} />
      ) : (
        <AddDeviceForm onDeviceAdded={handleDeviceAdded} />
      )} */}

      {/* Afișează lista de dispozitive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {devices.map((device) => (
          <div key={device.device_id} className="p-4 bg-gray-800 rounded shadow">
            <h3 className="text-xl text-white">{device.name}</h3>
            <p className="text-gray-400">Device ID: {device.device_id}</p>
            <button
              onClick={() => handleEditDevice(device)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
            >
              Edit Device
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
