// "use client";

// import { CheckCircle2, Loader2 } from "lucide-react";
// import { useState, useMemo } from "react";
// import {
//   useGetOthersTaskOptions,
//   TaskOption,
// } from "@/hooks/api/others-task-options/use-others-task-options";
// import { useUpdateServiceProviderInfo } from "@/hooks/api/user/use-update-service-provider-info";
// import { useCategories } from "@/hooks/api/use-categories";
// import { useCreateWorkSchedule } from "@/hooks/api/work-schedule/use-work-schedule";

// type Step = 0 | 1 | 2 | 3;
// type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const DAY_FULL: Record<DayKey, string> = {
//   Mon: "Monday",
//   Tue: "Tuesday",
//   Wed: "Wednesday",
//   Thu: "Thursday",
//   Fri: "Friday",
//   Sat: "Saturday",
//   Sun: "Sunday",
// };

// const slides = [
//   {
//     id: 1,
//     illustration: "/icons/home/1.svg",
//     title: "Your\nSpecialties",
//     description:
//       "Select the service categories you offer. Clients will use these to find and book you.",
//   },
//   {
//     id: 2,
//     illustration: "/icons/home/1.svg",
//     title: "Work\nschedule",
//     description: "When are you available to offer your services?",
//   },
//   {
//     id: 3,
//     illustration: "/icons/home/1.svg",
//     title: "Services\nyou offer",
//     description:
//       "Tell clients what additional services you can offer. Choose the options that apply to you.",
//   },
//   {
//     id: 4,
//     illustration: "/icons/home/3.svg",
//     title: "Ready\nto go!",
//     description: "Your profile is all set. Start accepting bookings!",
//   },
// ];

// interface DaySchedule {
//   status: boolean;
//   startTime: string;
//   endTime: string;
// }

// interface FormData {
//   specialistsInIds: string[];
//   taskOptions: Record<string, boolean>;
//   bio: string;
//   perHourPrice: string;
//   schedule: Record<DayKey, DaySchedule>;
//   categories: string[];
//   coverImage: File | null;
// }

// const defaultDaySchedule: DaySchedule = {
//   status: false,
//   startTime: "09:00",
//   endTime: "18:00",
// };

// export default function ProviderSetupGate({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { data: taskOptions = [], isLoading: loadingTasks } =
//     useGetOthersTaskOptions();
//   const { data: categories = [], isLoading: loadingCategories } =
//     useCategories();
//   const { mutate: createSchedule, isPending: loadingSchedule } =
//     useCreateWorkSchedule();
//   const { mutate: updateServiceProvider, isPending: loadingServiceProvider } =
//     useUpdateServiceProviderInfo();

//   const [step, setStep] = useState<Step>(0);
//   const [form, setForm] = useState<FormData>({
//     specialistsInIds: [],
//     taskOptions: {},
//     bio: "Dedicated healthcare professional providing reliable and compassionate care.",
//     perHourPrice: "45",
//     categories: [],
//     coverImage: null,
//     schedule: {
//       Mon: {
//         ...defaultDaySchedule,
//         status: true,
//         startTime: "09:00",
//         endTime: "17:00",
//       },
//       Tue: {
//         ...defaultDaySchedule,
//         status: true,
//         startTime: "09:00",
//         endTime: "17:00",
//       },
//       Wed: {
//         ...defaultDaySchedule,
//         status: true,
//         startTime: "09:00",
//         endTime: "17:00",
//       },
//       Thu: {
//         ...defaultDaySchedule,
//         status: true,
//         startTime: "09:00",
//         endTime: "17:00",
//       },
//       Fri: {
//         ...defaultDaySchedule,
//         status: true,
//         startTime: "09:00",
//         endTime: "17:00",
//       },
//       Sat: { ...defaultDaySchedule },
//       Sun: { ...defaultDaySchedule },
//     },
//   });
//   const [done, setDone] = useState(false);

//   // Initialize taskOptions when they're loaded
//   const initializedForm = useMemo(() => {
//     if (taskOptions.length > 0 && Object.keys(form.taskOptions).length === 0) {
//       const taskOptionsMap: Record<string, boolean> = {};
//       taskOptions.forEach((option) => {
//         taskOptionsMap[option.id] = false;
//       });
//       return {
//         ...form,
//         taskOptions: taskOptionsMap,
//       };
//     }
//     return form;
//   }, [taskOptions, form]);

//   // Update form when initializedForm changes
//   if (Object.keys(form.taskOptions).length === 0 && taskOptions.length > 0) {
//     setForm(initializedForm);
//   }

//   const slide = slides[step];
//   const isSubmitting = loadingSchedule || loadingServiceProvider;

//   function toggleCategory(id: string) {
//     setForm((p) => ({
//       ...p,
//       specialistsInIds: p.specialistsInIds.includes(id)
//         ? p.specialistsInIds.filter((c) => c !== id)
//         : [...p.specialistsInIds, id],
//     }));
//   }

//   function toggleTaskOption(id: string) {
//     setForm((p) => ({
//       ...p,
//       taskOptions: {
//         ...p.taskOptions,
//         [id]: !p.taskOptions[id],
//       },
//     }));
//   }

//   function toggleDay(day: DayKey) {
//     setForm((p) => ({
//       ...p,
//       schedule: {
//         ...p.schedule,
//         [day]: { ...p.schedule[day], status: !p.schedule[day].status },
//       },
//     }));
//   }

//   function updateDayTime(
//     day: DayKey,
//     field: "startTime" | "endTime",
//     value: string,
//   ) {
//     setForm((p) => ({
//       ...p,
//       schedule: {
//         ...p.schedule,
//         [day]: { ...p.schedule[day], [field]: value },
//       },
//     }));
//   }

//   function next() {
//     if (step < 3) {
//       setStep((s) => (s + 1) as Step);
//     } else {
//       submit();
//     }
//   }

//   function back() {
//     if (step > 0) setStep((s) => (s - 1) as Step);
//   }

//   async function submit() {
//     console.log("[v0] Submitting form data:", form);

//     try {
//       // Build workSchedule payload
//       const workSchedulePayload = DAYS.filter(
//         (day) => form.schedule[day].status,
//       ).map((day) => {
//         const sched = form.schedule[day];
//         // Parse time strings (HH:mm) and combine with a date
//         const today = new Date().toISOString().split("T")[0];
//         const startTime = new Date(`${today}T${sched.startTime}:00.000Z`);
//         const endTime = new Date(`${today}T${sched.endTime}:00.000Z`);

//         return {
//           day,
//           userId: "current-user-id",
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           status: true,
//         };
//       });

//       // Build service provider info payload with task options as keys
//       const serviceProviderPayload: Record<string, any> = {
//         specialistsIn: form.specialistsInIds,
//         bio: form.bio,
//         perHourPrice: parseFloat(form.perHourPrice) || 0,
//       };

//       // Add task options as boolean properties
//       taskOptions.forEach((option) => {
//         // Convert option ID/value to camelCase key (e.g., "Palliative Care" -> "palliativeCare")
//         const key = option.value.split(" ").reduce((acc, word, i) => {
//           if (i === 0) return word.toLowerCase();
//           return (
//             acc + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//           );
//         }, "");

//         serviceProviderPayload[key] = form.taskOptions[option.id] || false;
//       });

//       console.log("[v0] Work Schedule Payload:", workSchedulePayload);
//       console.log(
//         "[v0] Service Provider Info Payload:",
//         serviceProviderPayload,
//       );

//       // Make API calls
//       if (workSchedulePayload.length > 0) {
//         console.log("[v0] Creating work schedule...");
//         await createSchedule(workSchedulePayload);
//       }

//       console.log("[v0] Updating service provider info...");
//       await updateServiceProvider(serviceProviderPayload);

//       console.log("[v0] All submissions completed successfully");
//       setDone(true);
//     } catch (error) {
//       console.error("[v0] Submission error:", error);
//     }
//   }

//   const canProceed =
//     step === 0
//       ? form.specialistsInIds.length > 0
//       : step === 1
//         ? true
//         : step === 2
//           ? true
//           : !isSubmitting;

//   if (done) return <>{children}</>;

//   const isScheduleStep = step === 1;

//   return (
//     <div className="z-100 flex flex-col bg-[#f0f0f0] min-h-screen font-sans">
//       {/* Back / Skip row */}
//       <div className="flex h-14 items-center justify-between px-6 sm:px-10">
//         {step > 0 ? (
//           <button
//             type="button"
//             onClick={back}
//             disabled={isSubmitting}
//             className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline disabled:opacity-50"
//           >
//             Back
//           </button>
//         ) : (
//           <span />
//         )}
//         {step < 3 && (
//           <button
//             type="button"
//             onClick={() => setStep(3)}
//             className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
//           >
//             Skip
//           </button>
//         )}
//       </div>

//       {/* Illustration — hidden for schedule step */}
//       {!isScheduleStep && (
//         <div className="flex flex-1 items-end justify-center pb-8 min-h-[200px]">
//           <div className="relative h-64 w-80 sm:h-80 sm:w-96 flex items-end justify-center">
//             <img
//               key={slide.id}
//               src={slide.illustration}
//               alt={slide.title}
//               className="max-h-full max-w-full object-contain object-bottom transition-all duration-300 drop-shadow-sm"
//             />
//           </div>
//         </div>
//       )}

//       {/* Text + controls */}
//       <div className="flex flex-col items-start gap-3 px-8 pb-10 sm:items-center sm:px-16 sm:text-center w-full max-w-2xl mx-auto">
//         <h2 className="text-2xl font-bold leading-snug text-[#1e2d4f] sm:text-3xl tracking-tight">
//           {slide.title.split("\n").map((line, i, arr) => (
//             <span key={i}>
//               {line}
//               {i < arr.length - 1 && <br />}
//             </span>
//           ))}
//         </h2>
//         <p className="max-w-sm text-sm leading-relaxed text-gray-500">
//           {slide.description}
//         </p>

//         {/* Step 0: Category selection */}
//         {step === 0 && (
//           <div className="mt-2 w-full max-w-md">
//             {loadingCategories ? (
//               <div className="flex justify-center py-6">
//                 <Loader2 className="size-5 animate-spin text-gray-400" />
//               </div>
//             ) : categories.length > 0 ? (
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
//                 {categories.map((cat) => (
//                   <button
//                     key={cat.id}
//                     type="button"
//                     onClick={() => toggleCategory(cat.id)}
//                     className={`rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
//                       form.specialistsInIds.includes(cat.id)
//                         ? "bg-blue-600 text-white shadow-md scale-[1.02]"
//                         : "bg-white text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50"
//                     }`}
//                   >
//                     {cat.name}
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-400">No categories available</p>
//             )}
//             {form.specialistsInIds.length > 0 && (
//               <p className="mt-3 text-center text-xs text-blue-600 font-semibold">
//                 {form.specialistsInIds.length} selected
//               </p>
//             )}
//           </div>
//         )}

//         {/* Step 1: Work schedule */}
//         {step === 1 && (
//           <div className="mt-2 w-full max-w-sm divide-y divide-gray-200/80 bg-white rounded-2xl px-5 py-2 shadow-sm">
//             {DAYS.map((day) => {
//               const sched = form.schedule[day];
//               return (
//                 <div key={day} className="py-3.5">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-semibold text-gray-800">
//                       {DAY_FULL[day]}
//                     </span>
//                     <div className="flex items-center gap-3">
//                       <button
//                         type="button"
//                         onClick={() => toggleDay(day)}
//                         className={`relative h-7 w-12 rounded-full transition-colors cursor-pointer ${
//                           sched.status ? "bg-blue-600" : "bg-gray-200"
//                         }`}
//                       >
//                         <span
//                           className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
//                             sched.status ? "translate-x-5" : "translate-x-0"
//                           }`}
//                         />
//                       </button>
//                       <span
//                         className={`w-24 text-xs font-medium text-right ${
//                           sched.status ? "text-gray-700" : "text-gray-400"
//                         }`}
//                       >
//                         {sched.status ? "Available" : "Not available"}
//                       </span>
//                     </div>
//                   </div>
//                   {sched.status && (
//                     <div className="mt-2.5 flex items-center justify-end gap-2 text-right">
//                       <input
//                         type="time"
//                         value={sched.startTime}
//                         onChange={(e) =>
//                           updateDayTime(day, "startTime", e.target.value)
//                         }
//                         className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 w-22"
//                       />
//                       <span className="text-gray-400 text-xs font-medium">
//                         to
//                       </span>
//                       <input
//                         type="time"
//                         value={sched.endTime}
//                         onChange={(e) =>
//                           updateDayTime(day, "endTime", e.target.value)
//                         }
//                         className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 w-22"
//                       />
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Step 2: Task Options */}
//         {step === 2 && (
//           <div className="mt-2 flex w-full max-w-sm flex-col gap-2.5">
//             {loadingTasks ? (
//               <div className="flex justify-center py-6">
//                 <Loader2 className="size-5 animate-spin text-gray-400" />
//               </div>
//             ) : taskOptions.length > 0 ? (
//               taskOptions.map((option: TaskOption) => (
//                 <label
//                   key={option.id}
//                   className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all border ${
//                     form.taskOptions[option.id]
//                       ? "bg-blue-50 border-blue-200 shadow-md"
//                       : "bg-white border-transparent hover:shadow-md"
//                   }`}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={form.taskOptions[option.id] || false}
//                     onChange={() => toggleTaskOption(option.id)}
//                     className="accent-blue-600 size-4 rounded cursor-pointer"
//                   />
//                   <span className="text-sm font-medium text-gray-700">
//                     {option.value}
//                   </span>
//                 </label>
//               ))
//             ) : (
//               <p className="text-sm text-gray-400">No task options available</p>
//             )}
//           </div>
//         )}

//         {/* Step 3: Success */}
//         {step === 3 && (
//           <div className="mt-2 w-full max-w-sm rounded-xl bg-white px-6 py-8 shadow-sm text-center border border-green-100">
//             <CheckCircle2 className="mx-auto mb-3 size-12 text-green-500 animate-bounce" />
//             <p className="text-sm font-medium text-gray-700">
//               All set! Your profile is ready to go live.
//             </p>
//           </div>
//         )}

//         {/* Dots */}
//         <div className="mt-4 flex gap-2 justify-center w-full">
//           {slides.map((s, i) => (
//             <span
//               key={s.id}
//               className={`size-2.5 rounded-full transition-colors ${
//                 i === step ? "bg-blue-600 w-6" : "bg-gray-300"
//               }`}
//             />
//           ))}
//         </div>

//         {/* Next / Submit */}
//         <button
//           type="button"
//           onClick={next}
//           disabled={!canProceed}
//           className="mt-4 w-full max-w-sm rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all cursor-pointer hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           {isSubmitting && <Loader2 className="size-4 animate-spin" />}
//           {step < 3
//             ? isScheduleStep
//               ? "Confirm"
//               : "Next"
//             : isSubmitting
//               ? "Saving..."
//               : "Go Live"}
//         </button>
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Page() {
  return <div>Page</div>;
}
