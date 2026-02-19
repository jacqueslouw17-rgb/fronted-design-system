/**
 * Flow 4.1 — Employee Dashboard v6 - Custom Time Input with auto-advance
 * Auto-moves cursor from hours to minutes after 2 digits
 * INDEPENDENT from v5 and all other flows.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
}

export const F41v6_TimeInput = ({ value, onChange, className, hasError }: TimeInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  
  // Parse initial value
  const parseValue = useCallback((val: string) => {
    if (!val) return { hours: '', minutes: '' };
    const parts = val.split(':');
    return {
      hours: parts[0] || '',
      minutes: parts[1] || ''
    };
  }, []);

  const [localHours, setLocalHours] = useState(() => parseValue(value).hours);
  const [localMinutes, setLocalMinutes] = useState(() => parseValue(value).minutes);

  // Track if we're actively editing to prevent external value overwrites
  const isEditingRef = useRef(false);

  // Keep local state in sync with the controlled `value`, but never while typing.
  useEffect(() => {
    if (isEditingRef.current) return;
    const { hours, minutes } = parseValue(value);
    setLocalHours(hours);
    setLocalMinutes(minutes);
  }, [value, parseValue]);

  const notifyChange = useCallback((h: string, m: string) => {
    if (h || m) {
      // Only pad when both values exist and are complete
      const formattedH = h.length === 2 ? h : h;
      const formattedM = m.length === 2 ? m : m;
      onChange(`${formattedH}:${formattedM}`);
    } else {
      onChange('');
    }
  }, [onChange]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    let val = e.target.value.replace(/\D/g, '');
    
    // If current value is already 2 digits and user types more, start fresh with new digit
    if (localHours.length === 2 && val.length > 2) {
      val = val.slice(-1); // Take only the last typed digit
    } else if (val.length > 2) {
      val = val.slice(0, 2);
    }
    
    // Clamp to valid hour range
    if (val.length === 2 && parseInt(val) > 23) {
      val = '23';
    }
    
    setLocalHours(val);
    notifyChange(val, localMinutes);
    
    // Auto-advance to minutes after 2 valid digits
    if (val.length === 2) {
      setTimeout(() => {
        minuteRef.current?.focus();
        minuteRef.current?.select();
      }, 0);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    let val = e.target.value.replace(/\D/g, '');
    
    // If current value is already 2 digits and user types more, start fresh with new digit
    if (localMinutes.length === 2 && val.length > 2) {
      val = val.slice(-1);
    } else if (val.length > 2) {
      val = val.slice(0, 2);
    }
    
    // Clamp to valid minute range
    if (val.length === 2 && parseInt(val) > 59) {
      val = '59';
    }
    
    setLocalMinutes(val);
    notifyChange(localHours, val);
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight' || e.key === ':') {
      e.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || (e.key === 'Backspace' && localMinutes === '')) {
      e.preventDefault();
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  // Only pad values when leaving the entire component.
  // NOTE: `relatedTarget` is unreliable on some browsers/mobile, so we check `document.activeElement`.
  const handleContainerBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      const stillInside = !!containerRef.current && !!active && containerRef.current.contains(active);
      if (stillInside) return;

      isEditingRef.current = false;

      let paddedHours = localHours;
      let paddedMinutes = localMinutes;

      if (localHours.length === 1) {
        paddedHours = localHours.padStart(2, '0');
        setLocalHours(paddedHours);
      }
      if (localMinutes.length === 1) {
        paddedMinutes = localMinutes.padStart(2, '0');
        setLocalMinutes(paddedMinutes);
      }

      if (paddedHours !== localHours || paddedMinutes !== localMinutes) {
        notifyChange(paddedHours, paddedMinutes);
      }
    }, 0);
  };

  return (
    <div 
      ref={containerRef}
      onBlur={handleContainerBlur}
      className={cn(
        "flex items-center h-10 rounded-md border bg-background px-3 text-sm ring-offset-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        hasError ? "border-destructive" : "border-input",
        className
      )}
    >
      <input
        ref={hourRef}
        type="text"
        inputMode="numeric"
        placeholder="00"
        value={localHours}
        onChange={handleHoursChange}
        onKeyDown={handleHoursKeyDown}
        onFocus={(e) => e.currentTarget.select()}
        className="w-8 h-8 bg-transparent text-center outline-none placeholder:text-muted-foreground tabular-nums rounded focus:bg-muted/50 transition-colors"
        maxLength={2}
        aria-label="Hours"
      />
      <span className="text-muted-foreground mx-1 select-none">:</span>
      <input
        ref={minuteRef}
        type="text"
        inputMode="numeric"
        placeholder="00"
        value={localMinutes}
        onChange={handleMinutesChange}
        onKeyDown={handleMinutesKeyDown}
        onFocus={(e) => e.currentTarget.select()}
        className="w-8 h-8 bg-transparent text-center outline-none placeholder:text-muted-foreground tabular-nums rounded focus:bg-muted/50 transition-colors"
        maxLength={2}
        aria-label="Minutes"
      />
    </div>
  );
};
