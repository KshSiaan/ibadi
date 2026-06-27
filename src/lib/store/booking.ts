import { create } from "zustand";

export type BookingView = "profile" | "frequency" | "schedule" | "payment" | "confirmed";
export type BookingFrequency = "weekly" | "one_time";

interface BookingState {
  view: BookingView;
  frequency: BookingFrequency;
  selectedDays: Set<string>;
  selectedDate: Date | null;
  selectedTime: string | null;
  duration: number;
  paymentMethod: "paypal" | "visa" | "mastercard" | null;
  
  setView: (view: BookingView) => void;
  setFrequency: (frequency: BookingFrequency) => void;
  toggleDay: (day: string) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  setDuration: (duration: number) => void;
  setPaymentMethod: (method: "paypal" | "visa" | "mastercard") => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  view: "profile",
  frequency: "weekly",
  selectedDays: new Set(),
  selectedDate: null,
  selectedTime: null,
  duration: 2,
  paymentMethod: null,
  
  setView: (view) => set({ view }),
  setFrequency: (frequency) => set({ frequency }),
  toggleDay: (day) =>
    set((state) => {
      const newDays = new Set(state.selectedDays);
      if (newDays.has(day)) {
        newDays.delete(day);
      } else {
        newDays.add(day);
      }
      return { selectedDays: newDays };
    }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setDuration: (duration) => set({ duration }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () =>
    set({
      view: "profile",
      frequency: "weekly",
      selectedDays: new Set(),
      selectedDate: null,
      selectedTime: null,
      duration: 2,
      paymentMethod: null,
    }),
}));
