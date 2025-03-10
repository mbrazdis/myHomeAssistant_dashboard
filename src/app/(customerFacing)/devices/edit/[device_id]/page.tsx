"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditDeviceForm from '../../../../../components/EditDeviceForm';
import { Device } from '../../../../../types/Device';

interface Params {
  device_id: string;
}

export default function EditDevicePage() {
  const params = useParams() as unknown as Params; 
  const { device_id } = params;
  const router = useRouter();

  const initialDevice: Device = {
    device_id: device_id,
    name: "Default Name",
    shelly_id: "default_shelly_id",
    ison: false,
    source: "mqtt",
    has_timer: false,
    timer_started: 0,
    timer_duration: 0,
    timer_remaining: 0,
    mode: "white",
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    gain: 100,
    temp: 3000,
    brightness: 100,
    effect: 0,
  };

  const handleDeviceUpdated = () => {
    router.push('/');  
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Device</h1>
      <EditDeviceForm device={initialDevice} onDeviceUpdated={handleDeviceUpdated} />
    </div>
  );
}
