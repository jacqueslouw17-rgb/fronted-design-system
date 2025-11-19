import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CountrySettings {
  PH: {
    hoursPerDay: number;
    daysPerMonth: number;
    withholdingTax: {
      method: "bracket_table" | "flat_rate" | "external_formula";
      flatRate?: number; // For flat_rate method
      // bracket_table uses the existing Tax Table configuration
    };
  };
  NO: {
    hoursPerDay: number;
    daysPerMonth: number;
    withholdingTax: {
      method: "bracket_table" | "flat_rate" | "external_formula";
      flatRate?: number;
    };
  };
}

interface CountrySettingsStore {
  settings: CountrySettings;
  updateSettings: (country: 'PH' | 'NO', hoursPerDay: number, daysPerMonth: number) => void;
  updateWithholdingTax: (country: 'PH' | 'NO', method: CountrySettings['PH']['withholdingTax']['method'], flatRate?: number) => void;
  getSettings: (country: 'PH' | 'NO') => { hoursPerDay: number; daysPerMonth: number; withholdingTax: CountrySettings['PH']['withholdingTax'] };
}

export const useCountrySettings = create<CountrySettingsStore>()(
  persist(
    (set, get) => ({
      settings: {
        PH: {
          hoursPerDay: 8,
          daysPerMonth: 21.67,
          withholdingTax: {
            method: "bracket_table",
          },
        },
        NO: {
          hoursPerDay: 8,
          daysPerMonth: 21.7,
          withholdingTax: {
            method: "flat_rate",
            flatRate: 0,
          },
        },
      },
      updateSettings: (country, hoursPerDay, daysPerMonth) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [country]: {
              ...state.settings[country],
              hoursPerDay,
              daysPerMonth,
            },
          },
        })),
      updateWithholdingTax: (country, method, flatRate) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [country]: {
              ...state.settings[country],
              withholdingTax: {
                method,
                flatRate,
              },
            },
          },
        })),
      getSettings: (country) => get().settings[country],
    }),
    {
      name: 'country-settings-storage',
    }
  )
);
