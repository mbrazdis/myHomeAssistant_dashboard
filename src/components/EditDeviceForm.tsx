import React, { useState } from 'react';
import api from '../utils/api';
import { Device } from '../types/Device';

interface EditDeviceFormProps {
  device: Device;
  onDeviceUpdated: () => void;
}

const EditDeviceForm: React.FC<EditDeviceFormProps> = ({ device, onDeviceUpdated }) => {
  const [deviceData, setDeviceData] = useState<Pick<Device, "name" | "device_id">>({
    name: device.name,
    device_id: device.device_id,
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

      await api.put(`/devices/${device.device_id}`, {
        name: deviceData.name,
        device_id: device.device_id, 
        shelly_id: device.shelly_id, 
      });
      onDeviceUpdated();
      setError(null);
    } catch (error) {
      console.error("Error updating device:", error);
      setError('Error updating device. Please try again.');
    }
  };
  
  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-2xl font-bold mb-4">Edit Device</h2>
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
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDeviceForm;
