import React, { useState } from 'react';
import api from '../utils/api'; 

export default function AddDeviceForm({ onDeviceAdded }: { onDeviceAdded: () => void }) {
  const [deviceData, setDeviceData] = useState({
    name: '',
    device_id: '',
    shelly_id: '',
    ison: true,
 
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeviceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/devices/', deviceData);  
      onDeviceAdded();  
      setDeviceData({
        name: '',
        device_id: '',
        shelly_id: '',
        ison: true,
      });
      setError(null);
    } catch (error) {
      setError('Error adding device. Please try again.');
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-2xl font-bold mb-4">Add Device</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block">Device Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={deviceData.name}
            onChange={handleChange}
            className="w-full p-2 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="device_id" className="block">Device ID</label>
          <input
            type="text"
            id="device_id"
            name="device_id"
            value={deviceData.device_id}
            onChange={handleChange}
            className="w-full p-2 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="shelly_id" className="block">Shelly ID</label>
          <input
            type="text"
            id="shelly_id"
            name="shelly_id"
            value={deviceData.shelly_id}
            onChange={handleChange}
            className="w-full p-2 rounded"
            required
          />
        </div>
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Device
          </button>
        </div>
      </form>
    </div>
  );
}
