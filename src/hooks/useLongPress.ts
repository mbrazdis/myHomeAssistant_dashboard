// src/hooks/useLongPress.ts
import { useState, useRef } from 'react';

// Definim tipul generalizat pentru evenimente
type LongPressEventType = React.MouseEvent | React.TouchEvent;

export function useLongPress<T extends LongPressEventType = LongPressEventType>(
  onLongPress: (event: T) => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 500 } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = (event: T) => {
    if (shouldPreventDefault && event.target) {
      event.preventDefault();
    }
    
    target.current = event.target;
    timeout.current = setTimeout(() => {
      onLongPress(event);
      setLongPressTriggered(true);
    }, delay);
  };

  const clear = (event: T, shouldTriggerClick = true) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    
    if (shouldTriggerClick && !longPressTriggered) {
      onClick();
    }
    
    setLongPressTriggered(false);
  };

  return {
    onMouseDown: (e: React.MouseEvent) => start(e as T),
    onTouchStart: (e: React.TouchEvent) => start(e as T),
    onMouseUp: (e: React.MouseEvent) => clear(e as T),
    onMouseLeave: (e: React.MouseEvent) => clear(e as T, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e as T)
  };
}

export default useLongPress;