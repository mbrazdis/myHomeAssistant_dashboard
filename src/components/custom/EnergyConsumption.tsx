"use client";

import { useWebSocket } from "@/contexts/WebSocketContext";
import { useMemo } from "react";

export function EnergyConsumption() {
  const { deviceStatuses } = useWebSocket();
  
  const totalPower = useMemo(() => {
    return Object.values(deviceStatuses).reduce((sum, device) => 
      sum + (device.power || 0), 0
    );
  }, [deviceStatuses]);

  const totalEnergy = useMemo(() => {
    return Object.values(deviceStatuses).reduce((sum, device) => 
      sum + (device.energy || 0), 0
    );
  }, [deviceStatuses]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-white">Energy Usage</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Current:</span>
          <span className="text-white font-medium">{totalPower.toFixed(1)} W</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total energy:</span>
          <span className="text-white font-medium">{totalEnergy.toFixed(1)} kWh</span>
        </div>
      </div>
    </div>
  );
}