import { create } from "zustand";

export interface ServiceBookingState {
  /* ─── Service Selection ─── */
  selectedService: string;
  setSelectedService: (service: string) => void;

  /* ─── Schedule ─── */
  frequency: "once" | "weekly";
  setFrequency: (frequency: "once" | "weekly") => void;

  selectedDay: number;
  setSelectedDay: (day: number) => void;

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

  /* ─── Schedule ─── */
  frequency: "once",
  setFrequency: (frequency: "once" | "weekly") => set({ frequency }),

  selectedDay: 13,
  setSelectedDay: (day: number) => set({ selectedDay: day }),

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
      frequency: "once",
      selectedDay: 13,
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
