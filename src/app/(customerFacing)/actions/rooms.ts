"use server";

import db from "@/db/db";
import { z } from "zod";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

// Types
type RoomCreationResponse = {
    success: boolean;
    error?: string;
};

// Validation Schemas
const addSchema = z.object({
    name: z.string().min(1, "Room name is required"),
    devices: z.array(z.string()).default([])
});

const editSchema = z.object({
    name: z.string().min(1, "Room name is required"),
    devices: z.array(z.string()).default([])
});

// CRUD Operations
export async function getRooms() {
    try {
        const rooms = await db.room.findMany({
            include: {
                devices: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return rooms;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
}

export async function addRoom(prevState: unknown, formData: FormData): Promise<RoomCreationResponse> {
    try {
        const result = addSchema.safeParse({
            name: formData.get('name'),
            devices: formData.getAll('devices')
        });

        if (!result.success) {
            return {
                success: false,
                error: "Validation failed: " + JSON.stringify(result.error.formErrors.fieldErrors)
            };
        }

        const { name, devices } = result.data;

        await db.room.create({
            data: {
                name,
                devices: {
                    connect: devices.map(id => ({ id }))
                }
            }
        });

        revalidatePath("/rooms");
        return { success: true };
    } catch (error) {
        console.error('Error creating room:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create room'
        };
    }
}

export async function updateRoom(
    id: string,
    prevState: unknown,
    formData: FormData
): Promise<RoomCreationResponse> {
    try {
        const result = editSchema.safeParse({
            name: formData.get('name'),
            devices: formData.getAll('devices')
        });

        if (!result.success) {
            return {
                success: false,
                error: "Validation failed: " + JSON.stringify(result.error.formErrors.fieldErrors)
            };
        }

        const { name, devices } = result.data;
        const room = await db.room.findUnique({ where: { id } });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        await db.room.update({
            where: { id },
            data: {
                name,
                devices: {
                    set: [], // Remove all existing connections
                    connect: devices.map(deviceId => ({ id: deviceId }))
                }
            }
        });

        revalidatePath("/rooms");
        return { success: true };
    } catch (error) {
        console.error('Error updating room:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update room'
        };
    }
}

export async function deleteRoom(id: string): Promise<RoomCreationResponse> {
    try {
        const room = await db.room.findUnique({ where: { id } });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        await db.room.delete({
            where: { id }
        });

        revalidatePath("/rooms");
        return { success: true };
    } catch (error) {
        console.error('Error deleting room:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete room'
        };
    }
}

export async function getRoom(id: string) {
    const room = await db.room.findUnique({
        where: { id },
        include: {
            devices: true
        }
    });

    if (!room) {
        notFound();
    }

    return room;
}