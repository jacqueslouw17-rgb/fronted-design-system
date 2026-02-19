/**
 * Flow 4.1 — Employee Dashboard v7 - Custom Time Input with auto-advance
 * INDEPENDENT from v6 and all other flows.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
}

export const F41v7_TimeInput = ({ value, onChange, className, hasError }: TimeInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  
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
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (isEditingRef.current) return;
    const { hours, minutes } = parseValue(value);
    setLocalHours(hours);
    setLocalMinutes(minutes);
  }, [value, parseValue]);

  const notifyChange = useCallback((h: string, m: string) => {
    if (h || m) {
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
    if (localHours.length === 2 && val.length > 2) {
      val = val.slice(-1);
    } else if (val.length > 2) {
      val = val.slice(0, 2);
    }
    if (val.length === 2 && parseInt(val) > 23) {
      val = '23';
    }
    setLocalHours(val);
    notifyChange(val, localMinutes);
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
    if (localMinutes.length === 2 && val.length > 2) {
      val = val.slice(-1);
    } else if (val.length > 2) {
      val = val.slice(0, 2);
    }
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
