import React from "react";
import { Device } from "../types/Device";

interface DeviceCardProps {
  device: Device;
  onToggle: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle }) => {
  console.log("Rendering DeviceCard:", device);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-xl font-bold">{device.name}</h2>
      <p>Device ID: {device.device_id}</p>
      <p>Status: {device.ison ? "On" : "Off"}</p>
      <button
        onClick={onToggle}
        className={`mt-2 px-4 py-2 rounded ${
          device.ison
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {device.ison ? "Turn Off" : "Turn On"}
      </button>
    </div>
  );
};

export default DeviceCard;
