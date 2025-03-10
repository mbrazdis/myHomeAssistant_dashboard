export interface Device {
    name: string;
    device_id: string;
    shelly_id: string;
    ison: boolean;
    source: string;
    has_timer: boolean;
    timer_started: number;
    timer_duration: number;
    timer_remaining: number;
    mode: string;
    red: number;
    green: number;
    blue: number;
    white: number;
    gain: number;
    temp: number;
    brightness: number;
    effect: number;
  }
  