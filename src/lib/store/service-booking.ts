import { create } from "zustand";
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

  /* ─── Homepage Filters (built on Search) ─── */
  homepageFilters: HomepageFilters;
  setHomepageFilters: (filters: HomepageFilters) => void;

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

  selectedWeekDays: Set<number>;
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
  checkedTasks: Set<string>;
  toggleTask: (task: string) => void;

  checkedConditions: Set<string>;
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

export const useServiceBooking = create<ServiceBookingState>((set) => ({
  /* ─── Service Selection ─── */
  selectedService: "Elderly care",
  setSelectedService: (service: string) => set({ selectedService: service }),

  selectedCategoryId: "",
  setSelectedCategoryId: (id: string) => set({ selectedCategoryId: id }),

  /* ─── Search ─── */
  searchTerm: "",
  setSearchTerm: (term: string) => set({ searchTerm: term }),

  /* ─── Homepage Filters ─── */
  homepageFilters: {},
  setHomepageFilters: (filters: HomepageFilters) =>
    set({ homepageFilters: filters }),

  /* ─── Address ─── */
  serviceAddress: "",
  setServiceAddress: (address: string) => set({ serviceAddress: address }),

  /* ─── Schedule ─── */
  frequency: "one_time",
  setFrequency: (frequency: "one_time" | "weekly") => set({ frequency }),

  selectedDay: new Date().getDate(),
  setSelectedDay: (day: number) => set({ selectedDay: day }),

  selectedMonth: new Date().getMonth(),
  setSelectedMonth: (month: number) => set({ selectedMonth: month }),

  selectedYear: new Date().getFullYear(),
  setSelectedYear: (year: number) => set({ selectedYear: year }),

  selectedWeekDays: new Set<number>(),
  toggleWeekDay: (day: number) =>
    set((state) => {
      const next = new Set(state.selectedWeekDays);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return { selectedWeekDays: next };
    }),

  exactHour: 9,
  setExactHour: (hour: number) => set({ exactHour: hour }),

  exactMinute: 0,
  setExactMinute: (minute: number) => set({ exactMinute: minute }),

  exactAmPm: "am",
  setExactAmPm: (value: "am" | "pm") => set({ exactAmPm: value }),

  duration: [2],
  setDuration: (duration: number[]) => set({ duration }),

  startType: "flexible",
  setStartType: (type: "flexible" | "exact") => set({ startType: type }),

  selectedMorning: null,
  setSelectedMorning: (slot: string | null) => set({ selectedMorning: slot }),

  selectedEvening: null,
  setSelectedEvening: (slot: string | null) => set({ selectedEvening: slot }),

  /* ─── Filter State ─── */
  checkedTasks: new Set<string>(),
  toggleTask: (task: string) =>
    set((state) => {
      const next = new Set(state.checkedTasks);
      if (next.has(task)) next.delete(task);
      else next.add(task);
      return { checkedTasks: next };
    }),

  checkedConditions: new Set<string>(),
  toggleCondition: (condition: string) =>
    set((state) => {
      const next = new Set(state.checkedConditions);
      if (next.has(condition)) next.delete(condition);
      else next.add(condition);
      return { checkedConditions: next };
    }),

  palliative: false,
  setPalliative: (value: boolean) => set({ palliative: value }),

  driving: false,
  setDriving: (value: boolean) => set({ driving: value }),

  business: false,
  setBusiness: (value: boolean) => set({ business: value }),

  /* ─── Utilities ─── */
  clearFilters: () =>
    set({
      checkedTasks: new Set(),
      checkedConditions: new Set(),
      palliative: false,
      driving: false,
      business: false,
    }),

  reset: () =>
    set({
      selectedService: "Elderly care",
      selectedCategoryId: "",
      searchTerm: "",
      homepageFilters: {},
      serviceAddress: "",
      frequency: "one_time",
      selectedDay: new Date().getDate(),
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      selectedWeekDays: new Set<number>(),
      exactHour: 9,
      exactMinute: 0,
      exactAmPm: "am",
      duration: [2],
      startType: "flexible",
      selectedMorning: null,
      selectedEvening: null,
      checkedTasks: new Set(),
      checkedConditions: new Set(),
      palliative: false,
      driving: false,
      business: false,
    }),
}));
