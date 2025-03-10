import api from '@/utils/api';

interface Device {
  id: string;
  name: string;
  roomId: string | null;
}

interface Room {
  id: string;
  name: string;
  devices: Device[];
}

export async function getRooms(): Promise<Room[]> {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
}

export async function addRoom(
  data: any, 
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await api.post('/rooms', formData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding room:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}