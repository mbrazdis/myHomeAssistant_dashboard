// src/pages/api/rooms/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch all rooms
    const rooms = await prisma.room.findMany({
      include: {
        devices: true,
      },
    });
    res.status(200).json(rooms);
  } else if (req.method === 'POST') {
    // Create a new room
    const { name, devices } = req.body;
    const newRoom = await prisma.room.create({
      data: {
        name,
        devices: {
          create: devices.map((deviceName: string) => ({ name: deviceName })),
        },
      },
      include: {
        devices: true,
      },
    });
    res.status(201).json(newRoom);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}