import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { HomepageFilters } from "@/lib/api/types";

export interface ServiceBookingState {
  /* ─── Service Selection ─── */
  selectedService: string;
  setSelectedService: (service: string) => void;

  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;

  /* ─── Search ─── */
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  /* ─── Homepage Filters ─── */
  homepageFilters: HomepageFilters;
  setHomepageFilters: (filters: HomepageFilters) => void;
  //

  /* ─── Address ─── */
  serviceAddress: string;
  setServiceAddress: (address: string) => void;

  /* ─── Schedule ─── */
  frequency: "one_time" | "weekly";
  setFrequency: (frequency: "one_time" | "weekly") => void;

  selectedDay: number;
  setSelectedDay: (day: number) => void;

  selectedMonth: number;
  setSelectedMonth: (month: number) => void;

  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Changed from Set<number>
  selectedWeekDays: number[];
  toggleWeekDay: (day: number) => void;

  exactHour: number;
  setExactHour: (hour: number) => void;

  exactMinute: number;
  setExactMinute: (minute: number) => void;

  exactAmPm: "am" | "pm";
  setExactAmPm: (value: "am" | "pm") => void;

  duration: number[];
  setDuration: (duration: number[]) => void;

  startType: "flexible" | "exact";
  setStartType: (type: "flexible" | "exact") => void;

  selectedMorning: string | null;
  setSelectedMorning: (slot: string | null) => void;

  selectedEvening: string | null;
  setSelectedEvening: (slot: string | null) => void;

  /* ─── Filter State ─── */

  // Changed from Set<string>
  checkedTasks: string[];
  toggleTask: (task: string) => void;

  // Changed from Set<string>
  checkedConditions: string[];
  toggleCondition: (condition: string) => void;

  palliative: boolean;
  setPalliative: (value: boolean) => void;

  driving: boolean;
  setDriving: (value: boolean) => void;

  business: boolean;
  setBusiness: (value: boolean) => void;

  /* ─── Utilities ─── */
  clearFilters: () => void;
  reset: () => void;
}

export const useServiceBooking = create<ServiceBookingState>()(
  persist(
    (set) => ({
      /* ─── Service Selection ─── */
      selectedService: "Elderly care",
      setSelectedService: (service) =>
        set({ selectedService: service }),

      selectedCategoryId: "",
      setSelectedCategoryId: (id) =>
        set({ selectedCategoryId: id }),

      /* ─── Search ─── */
      searchTerm: "",
      setSearchTerm: (term) =>
        set({ searchTerm: term }),

      /* ─── Homepage Filters ─── */
      homepageFilters: {},

      setHomepageFilters: (filters) =>
        set((state) => ({
          homepageFilters: {
            ...state.homepageFilters,
            ...filters,
          },
        })),

      /* ─── Address ─── */
      serviceAddress: "",
      setServiceAddress: (address) =>
        set({ serviceAddress: address }),

      /* ─── Schedule ─── */
      frequency: "one_time",
      setFrequency: (frequency) =>
        set({ frequency }),

      selectedDay: new Date().getDate(),
      setSelectedDay: (day) =>
        set({ selectedDay: day }),

      selectedMonth: new Date().getMonth(),
      setSelectedMonth: (month) =>
        set({ selectedMonth: month }),

      selectedYear: new Date().getFullYear(),
      setSelectedYear: (year) =>
        set({ selectedYear: year }),

      // Array instead of Set
      selectedWeekDays: [],

      toggleWeekDay: (day) =>
        set((state) => ({
          selectedWeekDays: state.selectedWeekDays.includes(day)
            ? state.selectedWeekDays.filter((d) => d !== day)
            : [...state.selectedWeekDays, day],
        })),

      exactHour: 9,
      setExactHour: (hour) =>
        set({ exactHour: hour }),

      exactMinute: 0,
      setExactMinute: (minute) =>
        set({ exactMinute: minute }),

      exactAmPm: "am",
      setExactAmPm: (value) =>
        set({ exactAmPm: value }),

      duration: [2],
      setDuration: (duration) =>
        set({ duration }),

      startType: "flexible",
      setStartType: (type) =>
        set({ startType: type }),

      selectedMorning: null,
      setSelectedMorning: (slot) =>
        set({ selectedMorning: slot }),

      selectedEvening: null,
      setSelectedEvening: (slot) =>
        set({ selectedEvening: slot }),
            /* ─── Filter State ─── */

      // Array instead of Set
      checkedTasks: [],

      toggleTask: (task) =>
        set((state) => {
          const checkedTasks = state.checkedTasks.includes(task)
            ? state.checkedTasks.filter((t) => t !== task)
            : [...state.checkedTasks, task];

          return {
            checkedTasks,

            homepageFilters: {
              ...state.homepageFilters,

              otherTaskIds:
                checkedTasks.length > 0
                  ? checkedTasks.join(",")
                  : undefined,
            },
          };
        }),

      // Array instead of Set
      checkedConditions: [],

      toggleCondition: (condition) =>
        set((state) => ({
          checkedConditions: state.checkedConditions.includes(condition)
            ? state.checkedConditions.filter((c) => c !== condition)
            : [...state.checkedConditions, condition],
        })),

      palliative: false,
      setPalliative: (value) =>
        set({ palliative: value }),

      driving: false,
      setDriving: (value) =>
        set({ driving: value }),

      business: false,
      setBusiness: (value) =>
        set({ business: value }),

      /* ─── Utilities ─── */

      clearFilters: () =>
      set((state) => ({
        checkedTasks: [],
        checkedConditions: [],

        palliative: false,
        driving: false,
        business: false,

        homepageFilters: {
          ...state.homepageFilters,

          otherTaskIds: undefined,

          // Leave the rest untouched.
          // If you later add experience/minPrice/etc.,
          // clear them here as well.
        },
      })),

reset: () =>
  set({
    /* ─── Service Selection ─── */
    selectedService: "Elderly care",
    selectedCategoryId: "",

    /* ─── Search ─── */
    searchTerm: "",

    /* ─── Homepage Filters ─── */
    homepageFilters: {},

    /* ─── Address ─── */
    serviceAddress: "",

    /* ─── Schedule ─── */
    frequency: "one_time",

    selectedDay: new Date().getDate(),
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),

    selectedWeekDays: [],

    exactHour: 9,
    exactMinute: 0,
    exactAmPm: "am",

    duration: [2],

    startType: "flexible",

    selectedMorning: null,
    selectedEvening: null,

    /* ─── Filters ─── */
    checkedTasks: [],
    checkedConditions: [],

    palliative: false,
    driving: false,
    business: false,
  }),
            }),
    {
      name: "service-booking",

      storage: createJSONStorage(() => localStorage),

      // Optional: only persist the state values.
      // Remove this if you want to persist absolutely everything.
      partialize: (state) => ({
        selectedService: state.selectedService,
        selectedCategoryId: state.selectedCategoryId,
        searchTerm: state.searchTerm,
        homepageFilters: state.homepageFilters,
        serviceAddress: state.serviceAddress,

        frequency: state.frequency,
        selectedDay: state.selectedDay,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
        selectedWeekDays: state.selectedWeekDays,

        exactHour: state.exactHour,
        exactMinute: state.exactMinute,
        exactAmPm: state.exactAmPm,

        duration: state.duration,
        startType: state.startType,

        selectedMorning: state.selectedMorning,
        selectedEvening: state.selectedEvening,

        checkedTasks: state.checkedTasks,
        checkedConditions: state.checkedConditions,

        palliative: state.palliative,
        driving: state.driving,
        business: state.business,
      }),
    }
  )
);