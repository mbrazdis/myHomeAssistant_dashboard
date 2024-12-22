"use client";

import React, { useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState([
    { id: 1, name: "Living Room Lights", devices: ["light_1", "light_2"] },
    { id: 2, name: "Kitchen Lights", devices: ["light_3"] },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-4 bg-gray-800 rounded shadow flex flex-col"
          >
            <h2 className="text-xl font-bold mb-2">{group.name}</h2>
            <p>Devices: {group.devices.join(", ")}</p>
            <button
              className="mt-4 bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
            >
              Turn On Group
            </button>
            <button
              className="mt-2 bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
            >
              Turn Off Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
