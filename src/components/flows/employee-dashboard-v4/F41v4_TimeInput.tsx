/**
 * Flow 4.1 — Custom Time Input with auto-advance
 * Auto-moves cursor from hours to minutes after 2 digits
 */

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
}

export const F41v4_TimeInput = ({ value, onChange, className, hasError }: TimeInputProps) => {
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  
  // Parse value into hours and minutes
  const [hours, minutes] = value ? value.split(':') : ['', ''];
  const [localHours, setLocalHours] = useState(hours || '');
  const [localMinutes, setLocalMinutes] = useState(minutes || '');

  // Sync with external value
  useEffect(() => {
    const [h, m] = value ? value.split(':') : ['', ''];
    setLocalHours(h || '');
    setLocalMinutes(m || '');
  }, [value]);

  const updateTime = (h: string, m: string) => {
    if (h && m) {
      onChange(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);
    } else if (h || m) {
      // Partial value - still update for validation
      onChange(`${h || ''}:${m || ''}`);
    } else {
      onChange('');
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    
    // Limit to 2 digits and max 23
    if (val.length > 2) val = val.slice(0, 2);
    if (parseInt(val) > 23) val = '23';
    
    setLocalHours(val);
    updateTime(val, localMinutes);
    
    // Auto-advance to minutes after 2 digits
    if (val.length === 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    
    // Limit to 2 digits and max 59
    if (val.length > 2) val = val.slice(0, 2);
    if (parseInt(val) > 59) val = '59';
    
    setLocalMinutes(val);
    updateTime(localHours, val);
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow right or colon moves to minutes
    if (e.key === 'ArrowRight' || e.key === ':') {
      e.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow left or backspace on empty moves to hours
    if (e.key === 'ArrowLeft' || (e.key === 'Backspace' && localMinutes === '')) {
      e.preventDefault();
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const handleHoursBlur = () => {
    // Pad single digit hours
    if (localHours.length === 1) {
      const padded = localHours.padStart(2, '0');
      setLocalHours(padded);
      updateTime(padded, localMinutes);
    }
  };

  const handleMinutesBlur = () => {
    // Pad single digit minutes
    if (localMinutes.length === 1) {
      const padded = localMinutes.padStart(2, '0');
      setLocalMinutes(padded);
      updateTime(localHours, padded);
    }
  };

  return (
    <div 
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
        onBlur={handleHoursBlur}
        onFocus={(e) => e.target.select()}
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
        onBlur={handleMinutesBlur}
        onFocus={(e) => e.target.select()}
        className="w-8 h-8 bg-transparent text-center outline-none placeholder:text-muted-foreground tabular-nums rounded focus:bg-muted/50 transition-colors"
        maxLength={2}
        aria-label="Minutes"
      />
    </div>
  );
};
