"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useServiceBooking } from "@/lib/store/service-booking";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

export default function FilterPage() {
  const {
    checkedTasks,
    toggleTask,
    checkedConditions,
    toggleCondition,
    palliative,
    setPalliative,
    driving,
    setDriving,
    business,
    setBusiness,
    clearFilters,
  } = useServiceBooking();

  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link
          href="/book/results"
          className="flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <button
          type="button"
          onClick={clearFilters}
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
                <label
                  key={task}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={checkedTasks.has(task)}
                    onCheckedChange={() => toggleTask(task)}
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
                <label
                  key={condition}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={checkedConditions.has(condition)}
                    onCheckedChange={() => toggleCondition(condition)}
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
