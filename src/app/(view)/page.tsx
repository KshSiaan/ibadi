"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Heart,
  Pencil,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Types ─── */
type View =
  | "home"
  | "care"
  | "search"
  | "schedule"
  | "finding"
  | "results"
  | "filter";

/* ─── Data ─── */
const popularServices = [
  { label: "Cleaning", icon: "/icons/cleaning-icon.svg" },
  { label: "Handyman", icon: "/icons/hammer-icon.svg" },
  { label: "Dog Grooming", icon: "/icons/dog-icon.svg" },
  { label: "Care", icon: "/icons/wellfare-icon.svg" },
  { label: "Others", icon: "/icons/gift-icon.svg" },
];

const weekDays = [
  { short: "Mon", date: 13 },
  { short: "Tue", date: 14 },
  { short: "Wed", date: 15 },
  { short: "Thu", date: 16 },
  { short: "Fri", date: 17 },
  { short: "Sat", date: 18 },
];

const morningSlots = ["9-0", "9-12", "12-15"];
const eveningSlots = ["15-18", "18-21", "21-00"];

const serviceQuestions = [
  "How does it work?",
  "Can they perform other tasks besides caregiving?",
  "Does it include care for people with medical conditions?",
  "The person to be cared for is in the hospital",
  "Can I book the service on a weekly basis?",
];

const otherTasks = [
  "Basic household cleaning",
  "Washing and ironing clothes",
  "Cooking",
  "Feeding the elderly",
  "Going for walks",
  "Medication reminder",
  "Help with personal hygiene",
  "Basic exercise",
  "Grocery shopping",
];

const specialistConditions = [
  "Senile dementia",
  "Alzheimer's",
  "Parkinson's",
  "Arthritis or osteoarthritis",
  "Arteriosclerosis",
  "Osteoporosis",
  "Blindness",
  "Deafness",
  "Cancer",
];

const mockProfessionals = [
  {
    id: "p1",
    name: "NB Sujon",
    avatar: "https://i.pravatar.cc/48?u=sujon1",
    rating: 5.0,
    reviews: 1,
    services: 1,
    price: "$10/h",
    tags: ["1 has repeated", "Updated Schedule"],
    verified: true,
  },
  {
    id: "p2",
    name: "NB Sujon",
    avatar: "https://i.pravatar.cc/48?u=sujon2",
    rating: 5.0,
    reviews: 1,
    services: 1,
    price: "$10/h",
    tags: ["1 has repeated", "Updated Schedule"],
    verified: true,
  },
  {
    id: "p3",
    name: "NB Sujon",
    avatar: "https://i.pravatar.cc/48?u=sujon3",
    rating: 5.0,
    reviews: 1,
    services: 1,
    price: "$10/h",
    tags: ["1 has repeated", "Updated Schedule"],
    verified: true,
  },
];

const findingReviews = [
  {
    id: "r1",
    avatar: "https://i.pravatar.cc/48?u=rev1",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
  {
    id: "r2",
    avatar: "https://i.pravatar.cc/48?u=rev2",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
  {
    id: "r3",
    avatar: "https://i.pravatar.cc/48?u=rev3",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet dolor sit amet.",
    stars: 4,
  },
];

/* ─── ServiceNode ─── */
function ServiceNode({
  icon,
  label,
  angleDeg,
  radius,
  onClick,
}: {
  icon: string;
  label: string;
  angleDeg: number;
  radius: number;
  onClick?: () => void;
}) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(rad));
  const y = Math.round(radius * Math.sin(rad));
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute flex flex-col items-center gap-2 focus:outline-none"
      style={{
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm transition-shadow hover:shadow-md"
        style={{ width: 88, height: 88 }}
      >
        <Image src={icon} alt={label} width={42} height={42} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

/* ─── Search Popover Content ─── */
function SearchPopoverContent({ onSearch }: { onSearch: () => void }) {
  const [query, setQuery] = useState("");
  return (
    <div className="flex w-[340px] flex-col gap-0 p-0">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          className="shrink-0 text-gray-400"
          onClick={onSearch}
        >
          <ArrowLeft className="size-4" />
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find the service you need"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="px-4 pb-3 pt-4">
        <p className="mb-3 text-xs font-semibold text-gray-400">
          Most popular in your area
        </p>
        <ul className="flex flex-col gap-1">
          {popularServices.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Image src={s.icon} alt={s.label} width={24} height={24} />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Notification Popover Content ─── */
function NotificationPopoverContent() {
  return (
    <div className="w-[300px] p-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">Notifications</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
        <Bell className="size-8 text-gray-200" />
        No notifications yet
      </div>
    </div>
  );
}

/* ─── Schedule View ─── */
function ScheduleView({
  onBack,
  onSearch,
}: {
  onBack: () => void;
  onSearch: () => void;
}) {
  const [frequency, setFrequency] = useState<"once" | "weekly">("once");
  const [selectedDay, setSelectedDay] = useState(13);
  const [duration, setDuration] = useState([2]);
  const [startType, setStartType] = useState<"flexible" | "exact">("flexible");
  const [selectedMorning, setSelectedMorning] = useState<string | null>(null);
  const [selectedEvening, setSelectedEvening] = useState<string | null>(null);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <div className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-base font-semibold text-white">
            When do you need it?
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-6">
        <h3 className="mb-3 text-base font-bold text-gray-800">Frequency</h3>
        <div className="mb-6 grid grid-cols-2 gap-2">
          {(["once", "weekly"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                "flex flex-col items-center rounded-full px-5 py-2 text-xs font-semibold transition-colors",
                frequency === f
                  ? "bg-primary text-white"
                  : "bg-white text-gray-500",
              )}
            >
              <span>{f === "once" ? "Just once" : "Weekly"}</span>
              <span className="text-[10px] font-normal opacity-70">
                {f === "once" ? "One-Time" : "Recurring"}
              </span>
            </button>
          ))}
        </div>

        {frequency === "once" ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">January</p>
              <button
                type="button"
                className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs text-gray-500"
              >
                Show month
              </button>
            </div>
            <div className="mb-6 flex gap-1.5">
              {weekDays.map((d) => (
                <button
                  type="button"
                  key={d.date}
                  onClick={() => setSelectedDay(d.date)}
                  className={cn(
                    "flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-medium transition-colors",
                    selectedDay === d.date
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600",
                  )}
                >
                  <span className="text-[10px] font-normal">{d.short}</span>
                  <span className="text-sm font-bold">{d.date}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Day(s) of the week
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <button
                  type="button"
                  key={d}
                  className="rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary first:bg-primary first:text-white"
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Duration{" "}
            <span className="font-bold text-primary">{duration[0]}h</span>
          </p>
          <Slider
            min={1}
            max={8}
            step={1}
            value={duration}
            onValueChange={setDuration}
          />
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-700">Start time</p>
        <div className="mb-6 flex gap-2">
          {(["flexible", "exact"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setStartType(t)}
              className={cn(
                "rounded-full border px-5 py-1.5 text-xs font-medium capitalize transition-colors",
                startType === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-white text-gray-500",
              )}
            >
              {t === "flexible" ? "Flexible start" : "Exact start"}
            </button>
          ))}
        </div>

        {startType === "exact" ? (
          <div className="mb-8 flex items-center justify-center rounded-xl bg-white py-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2">01</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2">00</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
              <div className="flex flex-col items-center">
                <button type="button" className="text-gray-400 text-xs">
                  ︿
                </button>
                <span className="px-2 text-sm">am</span>
                <button type="button" className="text-gray-400 text-xs">
                  ﹀
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold text-gray-400">Morning</p>
            <div className="mb-4 flex gap-2">
              {morningSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSelectedMorning(s);
                    setSelectedEvening(null);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-3 text-xs font-medium transition-colors",
                    selectedMorning === s
                      ? "bg-primary/10 text-primary"
                      : "bg-white text-gray-500",
                  )}
                >
                  <span className="text-base">☀️</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs font-semibold text-gray-400">Evening</p>
            <div className="mb-8 flex gap-2">
              {eveningSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSelectedEvening(s);
                    setSelectedMorning(null);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-3 text-xs font-medium transition-colors",
                    selectedEvening === s
                      ? "bg-primary/10 text-primary"
                      : "bg-white text-gray-500",
                  )}
                >
                  <span className="text-base">🌙</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Finding Screen ─── */
function FindingView({ serviceName }: { serviceName: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[#f5f5f5] px-8">
      {/* Review cards */}
      <div className="flex w-full max-w-md flex-col gap-3">
        {findingReviews.map((r, i) => (
          <div
            key={r.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-opacity",
              i === 1 ? "opacity-70" : i === 2 ? "opacity-40" : "opacity-100",
            )}
          >
            <Avatar className="size-10 shrink-0 ring-2 ring-primary/30">
              <AvatarImage src={r.avatar} alt="Reviewer" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star
                    key={idx}
                    className={cn(
                      "size-3.5",
                      idx < r.stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-gray-500">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Finding text */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-gray-500">
          Finding{" "}
          <span className="font-bold text-gray-800">{serviceName} care</span>{" "}
          professionals
        </p>
        <Progress value={progress} className="h-1.5 w-48" />
      </div>
    </div>
  );
}

/* ─── Results View ─── */
function ResultsView({
  serviceName,
  onBack,
}: {
  serviceName: string;
  onBack: () => void;
}) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [palliative, setPalliative] = useState(false);
  const [driving, setDriving] = useState(false);
  const [business, setBusiness] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [checkedConditions, setCheckedConditions] = useState<Set<string>>(
    new Set(),
  );

  function toggleSet(
    set: Set<string>,
    setter: (s: Set<string>) => void,
    key: string,
  ) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  function clearFilters() {
    setPalliative(false);
    setDriving(false);
    setBusiness(false);
    setCheckedTasks(new Set());
    setCheckedConditions(new Set());
  }

  return (
    <div className="flex min-h-dvh container mx-auto flex-col">
      {/* Filter Panel */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white px-[12%]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-gray-700"
            >
              Clear filters
            </button>
          </div>

          <div className="px-5 py-5 grid grid-cols-2">
            {/* Other required tasks */}
            <div className="">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Other required tasks
              </p>
              <div className="mb-6 space-y-3">
                {otherTasks.map((task) => {
                  const id = `task-${task.replace(/\s+/g, "-").toLowerCase()}`;
                  return (
                    <label
                      key={task}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 text-xs text-gray-600"
                    >
                      <Checkbox
                        id={id}
                        checked={checkedTasks.has(task)}
                        onCheckedChange={() =>
                          toggleSet(checkedTasks, setCheckedTasks, task)
                        }
                        className="size-4 rounded border-gray-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      />
                      {task}
                    </label>
                  );
                })}
              </div>
            </div>
            {/* Switch toggles */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Palliative care
                  </p>
                  <p className="text-xs text-gray-400">
                    Only show professionals specialising in palliative care
                  </p>
                </div>
                <Switch checked={palliative} onCheckedChange={setPalliative} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Driving licence
                  </p>
                  <p className="text-xs text-gray-400">
                    Only show professionals with a driving licence
                  </p>
                </div>
                <Switch checked={driving} onCheckedChange={setDriving} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Business profiles
                  </p>
                  <p className="text-xs text-gray-400">
                    Only profiles that correspond to a validated business or
                    self-employed professional.
                  </p>
                </div>
                <Switch checked={business} onCheckedChange={setBusiness} />
              </div>
            </div>
            <div className="col-span-2 border-t pt-6">
              {/* Show specialists in */}
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Show specialists in:
              </p>
              <div className="mb-6 flex flex-col gap-3">
                {specialistConditions.map((cond) => {
                  const id = `cond-${cond.replace(/\s+/g, "-").toLowerCase()}`;
                  return (
                    <label
                      key={cond}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 text-xs text-gray-600"
                    >
                      <Checkbox
                        id={id}
                        checked={checkedConditions.has(cond)}
                        onCheckedChange={() =>
                          toggleSet(
                            checkedConditions,
                            setCheckedConditions,
                            cond,
                          )
                        }
                        className="size-4 rounded border-gray-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      />
                      {cond}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Dialog */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-sm gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-base font-semibold text-gray-800">
              How does the {serviceName} service work?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Image
              src="/icons/elder-support-icon.svg"
              className="mx-auto block size-48"
              alt="Service Image"
              height={200}
              width={200}
            />
            <Accordion type="single" collapsible>
              {serviceQuestions.map((q, i) => (
                <AccordionItem key={q} value={`q-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium text-gray-700">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                    Augue non malesuada placerat faucibus nam purus sem.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-primary"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex flex-1 items-center rounded-xl bg-gray-100 px-3 py-2">
            <span className="flex-1 text-sm text-gray-700">{serviceName}</span>
            <Search className="size-4 text-gray-400" />
          </div>
          <button type="button" className="shrink-0 text-gray-500">
            <Heart className="size-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg px-4 py-4">
        {/* Filter row */}
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <CheckCircle2 className="size-3.5" />
            When?
          </button>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600"
          >
            <SlidersHorizontal className="size-3.5" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => setFaqOpen(true)}
            className="ml-auto flex items-center gap-1 text-xs text-primary"
          >
            <span>How does the service end?</span>
            <ArrowLeft className="size-3.5 rotate-180" />
          </button>
        </div>

        {/* Professional cards */}
        <div className="flex flex-col gap-3">
          {mockProfessionals.map((pro) => (
            <Link
              key={pro.id}
              href={`/user/${pro.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-12 shrink-0 ring-2 ring-primary/30">
                  <AvatarImage src={pro.avatar} alt={pro.name} />
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-800">
                        {pro.name}
                      </span>
                      {pro.verified && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {pro.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className="size-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {pro.rating} ({pro.reviews}) {pro.services} Service
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {pro.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter View ─── */
function FilterView({
  onBack,
  onClearFilters,
}: {
  onBack: () => void;
  onClearFilters: () => void;
}) {
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [checkedConditions, setCheckedConditions] = useState<Set<string>>(
    new Set(),
  );
  const [palliative, setPalliative] = useState(false);
  const [driving, setDriving] = useState(false);
  const [business, setBusiness] = useState(false);

  function toggleSet(
    set: Set<string>,
    setter: (s: Set<string>) => void,
    key: string,
  ) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-semibold text-gray-600 hover:text-gray-800"
        >
          Clear filters
        </button>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left — Checkboxes */}
        <div className="space-y-6">
          {/* Other required tasks */}
          <div>
            <h3 className="mb-3 text-base font-bold text-gray-800">
              Other required tasks
            </h3>
            <div className="space-y-2">
              {otherTasks.map((task) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
                <label
                  key={task}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={checkedTasks.has(task)}
                    onCheckedChange={() =>
                      toggleSet(checkedTasks, setCheckedTasks, task)
                    }
                  />
                  <span className="text-sm text-gray-700">{task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show specialists in */}
          <div>
            <h3 className="mb-3 text-base font-bold text-gray-800">
              Show specialists in:
            </h3>
            <div className="space-y-2">
              {specialistConditions.map((condition) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
                <label
                  key={condition}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={checkedConditions.has(condition)}
                    onCheckedChange={() =>
                      toggleSet(
                        checkedConditions,
                        setCheckedConditions,
                        condition,
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">{condition}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Switches */}
        <div className="space-y-4">
          {/* Palliative care */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Palliative care
              </p>
              <p className="text-xs text-gray-400">
                Only show professionals specializing in palliative care
              </p>
            </div>
            <Switch checked={palliative} onCheckedChange={setPalliative} />
          </div>

          {/* Driving licence */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Driving licence
              </p>
              <p className="text-xs text-gray-400">
                Only show professionals with a driving licence
              </p>
            </div>
            <Switch checked={driving} onCheckedChange={setDriving} />
          </div>

          {/* Business profiles */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Business profiles
              </p>
              <p className="text-xs text-gray-400">
                Only profiles that correspond to a validated business or
                self-employed professional
              </p>
            </div>
            <Switch checked={business} onCheckedChange={setBusiness} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function Page() {
  const [view, setView] = useState<View>("home");
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Elderly care");

  function openService(name: string) {
    setSelectedService(name);
    setView("schedule");
  }

  function startFinding() {
    setView("finding");
    setTimeout(() => setView("results"), 3000);
  }

  if (view === "schedule") {
    return (
      <ScheduleView onBack={() => setView("search")} onSearch={startFinding} />
    );
  }

  if (view === "finding") {
    return <FindingView serviceName={selectedService} />;
  }

  if (view === "results") {
    return (
      <ResultsView
        serviceName={selectedService}
        onBack={() => setView("search")}
      />
    );
  }

  if (view === "filter") {
    return (
      <FilterView onBack={() => setView("search")} onClearFilters={() => {}} />
    );
  }

  if (view === "search") {
    return (
      <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
        <div className="bg-white px-6 py-3 shadow-sm">
          <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl bg-white">
            <button
              type="button"
              onClick={() => setView("home")}
              className="shrink-0 text-gray-400"
            >
              <ArrowLeft className="size-5 text-primary" />
            </button>
            <input
              placeholder="Find the service you need"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg px-6 py-5">
          <p className="mb-3 text-sm font-semibold text-gray-500">
            Most popular in your area
          </p>
          <ul className="flex flex-col gap-1">
            {popularServices.map((s) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() =>
                    s.label === "Care" ? setView("care") : openService(s.label)
                  }
                  className="flex w-full items-center gap-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Image src={s.icon} alt={s.label} width={28} height={28} />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center bg-[#f5f5f5]"
      style={{ minHeight: "calc(100dvh - 64px)" }}
    >
      {/* Top-right icons */}
      <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-8 sm:top-6">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
              aria-label="Search"
            >
              <Search className="size-4 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-auto p-0 shadow-lg"
          >
            <SearchPopoverContent onSearch={() => {}} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-gray-600" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-green-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-auto p-0 shadow-lg"
          >
            <NotificationPopoverContent />
          </PopoverContent>
        </Popover>
      </div>

      {/* Radial wheel */}
      {view === "home" && (
        <div
          className="relative origin-center scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100"
          style={{ width: 520, height: 520 }}
        >
          <div
            className="absolute flex flex-col items-center gap-2"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full border-2 border-primary bg-white shadow-lg"
              style={{ width: 148, height: 148 }}
            >
              <Image
                src="/icons/headphone-icon.svg"
                alt="Support"
                width={64}
                height={64}
              />
            </div>
            <span className="text-lg font-bold text-primary">Support</span>
          </div>

          <ServiceNode
            icon="/icons/house-icon.svg"
            label="Home"
            angleDeg={-90}
            radius={210}
            onClick={() => openService("Home")}
          />
          <ServiceNode
            icon="/icons/dog-icon.svg"
            label="Pets"
            angleDeg={-150}
            radius={210}
            onClick={() => openService("Pets")}
          />
          <ServiceNode
            icon="/icons/cleaning-icon.svg"
            label="Cleaning"
            angleDeg={-30}
            radius={210}
            onClick={() => openService("Cleaning")}
          />
          <ServiceNode
            icon="/icons/gift-icon.svg"
            label="Others"
            angleDeg={150}
            radius={210}
            onClick={() => openService("Others")}
          />
          <ServiceNode
            icon="/icons/wellfare-icon.svg"
            label="Care"
            angleDeg={30}
            radius={210}
            onClick={() => setView("care")}
          />
          <ServiceNode
            icon="/icons/hammer-icon.svg"
            label="Handyman"
            angleDeg={90}
            radius={210}
            onClick={() => openService("Handyman")}
          />
        </div>
      )}

      {/* Care sub-view */}
      {view === "care" && (
        <div
          className="flex w-full flex-1 flex-col"
          style={{ minHeight: "calc(100dvh - 64px)" }}
        >
          <div className="relative flex items-center justify-center px-6 pt-6 pb-2">
            <button
              type="button"
              onClick={() => setView("home")}
              className="absolute top-24 flex items-center gap-1 text-base font-semibold text-primary"
            >
              <ArrowLeft className="size-5" />
              Care
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-10">
            <button
              type="button"
              onClick={() => openService("Children care")}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm hover:shadow-md"
                style={{ width: 88, height: 88 }}
              >
                <Image
                  src="/icons/children-icon.svg"
                  alt="Children"
                  width={42}
                  height={42}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Children
              </span>
            </button>
            <button
              type="button"
              onClick={() => openService("Elderly care")}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm hover:shadow-md"
                style={{ width: 88, height: 88 }}
              >
                <Image
                  src="/icons/elder-icon.svg"
                  alt="Elders"
                  width={42}
                  height={42}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Elders</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 pb-12">
            <p className="text-sm font-semibold text-gray-700">
              Tallapoosa county, east-central Alabama, U.S
            </p>
          </div>
        </div>
      )}

      {/* Add address button */}
      {view === "home" && (
        <button
          type="button"
          onClick={() => setAddressOpen(true)}
          className="mt-8 flex items-center gap-1 text-lg font-bold text-primary"
        >
          + Add address
          <ChevronDown className="size-5" />
        </button>
      )}

      {/* Service address dialog */}
      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-w-sm gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Service address
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Select where you want to receive the service
          </p>

          <InputGroup className="rounded-xl border-gray-100 bg-gray-50 px-4 py-3">
            <InputGroupAddon>
              <CheckCircle2 className="size-5 text-primary" />
            </InputGroupAddon>
            <Input
              placeholder="Your address"
              className="border-0 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:shadow-none"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" variant="ghost">
                <Pencil className="size-4 text-gray-400 hover:text-primary" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <button
            type="button"
            onClick={() => {
              setAddressOpen(false);
              setView("search");
            }}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add address
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
