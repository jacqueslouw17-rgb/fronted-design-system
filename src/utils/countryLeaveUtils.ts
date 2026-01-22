/**
 * Country-aware leave utilities
 * Handles holidays, weekend rules, and leave policy calculations
 */

import { supabase } from '@/integrations/supabase/client';

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

export interface CountryRules {
  countryCode: string;
  weekendDays: number[]; // 0 = Sunday, 6 = Saturday
  maxAnnualLeave: number;
  minNoticeDays: number;
  holidays: Holiday[];
}

// Cache for country rules to avoid repeated API calls
const rulesCache: Map<string, { rules: CountryRules; fetchedAt: number }> = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Fetch country rules including holidays from the edge function
 */
export async function fetchCountryRules(
  countryCode: string,
  year?: number
): Promise<CountryRules | null> {
  const cacheKey = `${countryCode}-${year || new Date().getFullYear()}`;
  const cached = rulesCache.get(cacheKey);
  
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.rules;
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-country-holidays', {
      body: { countryCode, year },
    });

    if (error) {
      console.error('Error fetching country rules:', error);
      return null;
    }

    rulesCache.set(cacheKey, { rules: data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    console.error('Failed to fetch country rules:', err);
    return null;
  }
}

/**
 * Check if a date is a weekend based on country rules
 */
export function isWeekend(date: Date, weekendDays: number[]): boolean {
  return weekendDays.includes(date.getDay());
}

/**
 * Check if a date is a public holiday
 */
export function isHoliday(date: Date, holidays: Holiday[]): Holiday | undefined {
  const dateStr = date.toISOString().split('T')[0];
  return holidays.find(h => h.date === dateStr);
}

/**
 * Calculate business days between two dates, excluding weekends and holidays
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  weekendDays: number[],
  holidays: Holiday[]
): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current, weekendDays) && !isHoliday(current, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Get all non-working days (weekends + holidays) for a date range
 */
export function getNonWorkingDays(
  startDate: Date,
  endDate: Date,
  weekendDays: number[],
  holidays: Holiday[]
): { date: Date; reason: string }[] {
  const nonWorkingDays: { date: Date; reason: string }[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const holiday = isHoliday(current, holidays);
    if (holiday) {
      nonWorkingDays.push({ date: new Date(current), reason: holiday.localName });
    } else if (isWeekend(current, weekendDays)) {
      nonWorkingDays.push({ date: new Date(current), reason: 'Weekend' });
    }
    current.setDate(current.getDate() + 1);
  }
  
  return nonWorkingDays;
}

/**
 * Validate leave request against country rules
 */
export interface LeaveValidation {
  isValid: boolean;
  warnings: string[];
  businessDays: number;
  holidaysInRange: Holiday[];
}

export function validateLeaveRequest(
  startDate: Date,
  endDate: Date,
  rules: CountryRules,
  usedAnnualLeave: number = 0
): LeaveValidation {
  const warnings: string[] = [];
  
  // Calculate business days
  const businessDays = calculateBusinessDays(
    startDate,
    endDate,
    rules.weekendDays,
    rules.holidays
  );
  
  // Find holidays in the range
  const holidaysInRange: Holiday[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const holiday = isHoliday(current, rules.holidays);
    if (holiday) {
      holidaysInRange.push(holiday);
    }
    current.setDate(current.getDate() + 1);
  }
  
  // Check notice period
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilStart = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilStart < rules.minNoticeDays && daysUntilStart >= 0) {
    warnings.push(
      `Short notice: ${rules.countryCode} typically requires ${rules.minNoticeDays} days notice for leave requests.`
    );
  }
  
  // Check annual leave limit
  if (rules.maxAnnualLeave > 0) {
    const totalUsed = usedAnnualLeave + businessDays;
    if (totalUsed > rules.maxAnnualLeave) {
      warnings.push(
        `This would exceed the statutory ${rules.maxAnnualLeave}-day annual leave allowance for ${rules.countryCode}.`
      );
    }
  }
  
  // Notify about holidays in range
  if (holidaysInRange.length > 0) {
    const holidayNames = holidaysInRange.map(h => h.localName).join(', ');
    warnings.push(
      `Your leave includes ${holidaysInRange.length} public holiday(s): ${holidayNames}. These won't be deducted from your allowance.`
    );
  }
  
  return {
    isValid: true,
    warnings,
    businessDays,
    holidaysInRange,
  };
}

/**
 * Get weekend day names based on country rules
 */
export function getWeekendDayNames(weekendDays: number[]): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekendDays.map(d => dayNames[d]).join(' & ');
}
