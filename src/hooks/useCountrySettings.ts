import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CountrySettings {
  PH: {
    hoursPerDay: number;
    daysPerMonth: number;
  };
  NO: {
    hoursPerDay: number;
    daysPerMonth: number;
  };
}

interface CountrySettingsStore {
  settings: CountrySettings;
  updateSettings: (country: 'PH' | 'NO', hoursPerDay: number, daysPerMonth: number) => void;
  getSettings: (country: 'PH' | 'NO') => { hoursPerDay: number; daysPerMonth: number };
}

export const useCountrySettings = create<CountrySettingsStore>()(
  persist(
    (set, get) => ({
      settings: {
        PH: {
          hoursPerDay: 8,
          daysPerMonth: 21.67,
        },
        NO: {
          hoursPerDay: 8,
          daysPerMonth: 21.7,
        },
      },
      updateSettings: (country, hoursPerDay, daysPerMonth) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [country]: {
              hoursPerDay,
              daysPerMonth,
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
