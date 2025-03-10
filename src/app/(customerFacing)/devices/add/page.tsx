"use client";

import React from 'react';
import AddDeviceForm from '../../../../components/AddDeviceForm';

export default function AddDevicePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add Device</h1>
      <AddDeviceForm onDeviceAdded={() => window.location.href = '/'} />
    </div>
  );
}
