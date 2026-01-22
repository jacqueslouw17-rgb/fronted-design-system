import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

interface CountryRules {
  countryCode: string;
  weekendDays: number[]; // 0 = Sunday, 6 = Saturday
  maxAnnualLeave: number; // Statutory minimum in days
  minNoticeDays: number; // Required notice for leave requests
  holidays: Holiday[];
}

// Country-specific rules
const COUNTRY_RULES: Record<string, Omit<CountryRules, 'holidays' | 'countryCode'>> = {
  NO: { weekendDays: [0, 6], maxAnnualLeave: 25, minNoticeDays: 14 }, // Norway
  PH: { weekendDays: [0, 6], maxAnnualLeave: 5, minNoticeDays: 5 },   // Philippines
  US: { weekendDays: [0, 6], maxAnnualLeave: 0, minNoticeDays: 7 },   // USA (no statutory)
  GB: { weekendDays: [0, 6], maxAnnualLeave: 28, minNoticeDays: 7 },  // UK
  DE: { weekendDays: [0, 6], maxAnnualLeave: 20, minNoticeDays: 14 }, // Germany
  FR: { weekendDays: [0, 6], maxAnnualLeave: 25, minNoticeDays: 14 }, // France
  AE: { weekendDays: [5, 6], maxAnnualLeave: 30, minNoticeDays: 7 },  // UAE (Fri-Sat weekend)
  SA: { weekendDays: [5, 6], maxAnnualLeave: 21, minNoticeDays: 7 },  // Saudi Arabia
  IN: { weekendDays: [0, 6], maxAnnualLeave: 15, minNoticeDays: 7 },  // India
  AU: { weekendDays: [0, 6], maxAnnualLeave: 20, minNoticeDays: 7 },  // Australia
  SG: { weekendDays: [0, 6], maxAnnualLeave: 7, minNoticeDays: 7 },   // Singapore
  JP: { weekendDays: [0, 6], maxAnnualLeave: 10, minNoticeDays: 14 }, // Japan
};

const DEFAULT_RULES = { weekendDays: [0, 6], maxAnnualLeave: 20, minNoticeDays: 7 };

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { countryCode, year } = await req.json();
    
    if (!countryCode) {
      console.error('Missing countryCode parameter');
      return new Response(
        JSON.stringify({ error: 'countryCode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetYear = year || new Date().getFullYear();
    const upperCountryCode = countryCode.toUpperCase();
    
    console.log(`Fetching holidays for ${upperCountryCode} in ${targetYear}`);

    // Fetch holidays from Nager.Date API (free, no auth required)
    const holidaysUrl = `https://date.nager.at/api/v3/PublicHolidays/${targetYear}/${upperCountryCode}`;
    const holidaysResponse = await fetch(holidaysUrl);
    
    let holidays: Holiday[] = [];
    
    if (holidaysResponse.ok) {
      holidays = await holidaysResponse.json();
      console.log(`Found ${holidays.length} holidays for ${upperCountryCode}`);
    } else {
      console.warn(`Could not fetch holidays for ${upperCountryCode}: ${holidaysResponse.status}`);
      // Continue with empty holidays - don't fail the request
    }

    // Get country-specific rules
    const rules = COUNTRY_RULES[upperCountryCode] || DEFAULT_RULES;

    const response: CountryRules = {
      countryCode: upperCountryCode,
      weekendDays: rules.weekendDays,
      maxAnnualLeave: rules.maxAnnualLeave,
      minNoticeDays: rules.minNoticeDays,
      holidays: holidays.map(h => ({
        date: h.date,
        localName: h.localName,
        name: h.name,
        countryCode: h.countryCode,
        fixed: h.fixed,
        global: h.global,
        types: h.types || [],
      })),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching country rules:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch country rules', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
