// src/services/deviceApi.ts
import api from '@/utils/api';

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Endpoint principal - poate fi modificat ușor dacă se schimbă
const DEVICE_ENDPOINT = '/shelly/duorgbw';

// Helper pentru a suprima erorile din consolă pentru endpoint-uri care pot să nu existe
const quietApiCall = async <T>(apiPromise: Promise<T>): Promise<T> => {
  try {
    return await apiPromise;
  } catch (error) {
    // Conversia cu .toString() este necesară pentru a evita problema cu Error objects
    const errorStr = error ? error.toString() : 'Unknown error';
    if (errorStr.includes('404')) {
      console.log('[API Info] Endpoint not found', errorStr);
    } else {
      console.error('[API Error]', error);
    }
    throw error;
  }
};

export async function turnOnMultiple(deviceIds: string[]): Promise<void> {
  try {
    console.log('API call: Turning ON devices:', deviceIds);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/on_multiple`, { device_ids: deviceIds })
    );
    
    console.log('ON response:', response.data);
  } catch (error) {
    // Erorile sunt deja logate în quietApiCall
  }
}

export async function turnOffMultiple(deviceIds: string[]): Promise<void> {
  try {
    console.log('API call: Turning OFF devices:', deviceIds);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/off_multiple`, { device_ids: deviceIds })
    );
    
    console.log('OFF response:', response.data);
  } catch (error) {
    // Erorile sunt deja logate în quietApiCall
  }
}

export async function setColorMultiple(deviceIds: string[], color: RGB): Promise<void> {
  try {
    // Normalizăm valorile RGB între 0-255
    const normalizedColor = {
      r: Math.min(Math.max(Math.round(color.r), 0), 255),
      g: Math.min(Math.max(Math.round(color.g), 0), 255),
      b: Math.min(Math.max(Math.round(color.b), 0), 255)
    };
    
    console.log('API call: Setting color for devices:', deviceIds, normalizedColor);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/color_multiple`, {
        device_ids: deviceIds,
        red: normalizedColor.r,
        green: normalizedColor.g,
        blue: normalizedColor.b,
        gain: 100
      })
    );
    
    console.log('COLOR response:', response.data);
  } catch (error) {
    console.error('Error setting color for devices:', error);
  }
}

export async function getDevicesStatus(): Promise<Record<string, any>> {
  // Încercăm endpoint-ul principal /devices/status
  try {
    console.log('Getting devices status from /devices/status');
    const response = await quietApiCall(api.get('/devices/status'));
    
    // Convertim răspunsul în formatul așteptat
    const devicesMap: Record<string, any> = {};
    
    if (response.data) {
      // Verificăm dacă e array sau obiect și procesăm corespunzător
      if (Array.isArray(response.data)) {
        response.data.forEach((device: any) => {
          if (device && device.device_id) {
            devicesMap[device.device_id] = device;
          }
        });
      } else if (response.data.devices && Array.isArray(response.data.devices)) {
        response.data.devices.forEach((device: any) => {
          if (device && device.device_id) {
            devicesMap[device.device_id] = device;
          }
        });
      } else if (typeof response.data === 'object') {
        Object.entries(response.data).forEach(([key, value]) => {
          if (typeof value === 'object') {
            devicesMap[key] = value;
          }
        });
      }
    }
    
    if (Object.keys(devicesMap).length > 0) {
      return devicesMap;
    }
  } catch (e) {
    // Ignorăm erorile, continuăm cu următoarea încercare
    console.log('Primary endpoint failed, trying backup');
  }

  // Încercăm endpoint-ul specific
  try {
    console.log(`Getting devices status from ${DEVICE_ENDPOINT}`);
    const response = await quietApiCall(api.get(DEVICE_ENDPOINT));
    
    const devicesMap: Record<string, any> = {};
    if (Array.isArray(response.data)) {
      response.data.forEach((device: any) => {
        if (device && device.device_id) {
          devicesMap[device.device_id] = device;
        }
      });
    }
    
    return devicesMap;
  } catch (e) {
    console.log('All endpoints failed, returning empty object');
    return {};
  }
}

export async function setWhiteMultiple(deviceIds: string[], white: number, gain: number): Promise<void> {
  try {
    // Ne asigurăm că white este între 0-100, nu 0-255
    const normalizedWhite = 100;
    
    console.log('API call: Setting white for devices:', deviceIds, normalizedWhite, gain);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/white_multiple`, {
        device_ids: deviceIds,
        white: 100, // Valoare în intervalul 0-100
        gain
      })
    );
    
    console.log('White response:', response.data);
  } catch (error) {
    console.error('Error setting white for devices:', error);
  }
}

export async function setBrightnessMultiple(deviceIds: string[], brightness: number): Promise<void> {
  try {
    // Ne asigurăm că brightness este între 1-100
    const normalizedBrightness = Math.min(Math.max(Math.round(brightness), 1), 100);
    
    console.log('API call: Setting brightness for devices:', deviceIds, normalizedBrightness);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/brightness_multiple`, {
        device_ids: deviceIds,
        brightness: normalizedBrightness
      })
    );
    
    console.log('Brightness response:', response.data);
  } catch (error) {
    console.error('Error setting brightness for devices:', error);
  }
}

export async function setTemperatureMultiple(deviceIds: string[], temperature: number): Promise<void> {
  try {
    // Ne asigurăm că temperatura este între 3000-6500K
    const normalizedTemperature = Math.min(Math.max(Math.round(temperature), 3000), 6500);
    
    console.log('API call: Setting temperature for devices:', deviceIds, normalizedTemperature);
    
    const response = await quietApiCall(
      api.post(`${DEVICE_ENDPOINT}/temperature_multiple`, {
        device_ids: deviceIds,
        temperature: normalizedTemperature
      })
    );
    
    console.log('Temperature response:', response.data);
  } catch (error) {
    console.error('Error setting temperature for devices:', error);
  }
}