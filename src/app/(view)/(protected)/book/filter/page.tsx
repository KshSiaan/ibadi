"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useServiceBooking } from "@/lib/store/service-booking";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FilterPage() {
  const t = useTranslations("BookFilter");
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

  const otherTasks = [
    t("taskBasicCleaning"),
    t("taskWashingIroning"),
    t("taskCooking"),
    t("taskFeedingElderly"),
    t("taskWalks"),
    t("taskMedicationReminder"),
    t("taskPersonalHygiene"),
    t("taskBasicExercise"),
    t("taskGroceryShopping"),
  ];

  const specialistConditions = [
    t("conditionSenileDementia"),
    t("conditionAlzheimers"),
    t("conditionParkinsons"),
    t("conditionArthritis"),
    t("conditionArteriosclerosis"),
    t("conditionOsteoporosis"),
    t("conditionBlindness"),
    t("conditionDeafness"),
    t("conditionCancer"),
  ];

  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link
          href="/book/results"
          className="flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-semibold text-gray-600 hover:text-gray-800"
        >
          {t("clearFilters")}
        </button>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left — Checkboxes */}
        <div className="space-y-6">
          {/* Other required tasks */}
          <div>
            <h3 className="mb-3 text-base font-bold text-gray-800">
              {t("otherRequiredTasks")}
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
              {t("showSpecialistsIn")}
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
                {t("palliativeCare")}
              </p>
              <p className="text-xs text-gray-400">
                {t("palliativeCareDescription")}
              </p>
            </div>
            <Switch checked={palliative} onCheckedChange={setPalliative} />
          </div>

          {/* Driving licence */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {t("drivingLicence")}
              </p>
              <p className="text-xs text-gray-400">
                {t("drivingLicenceDescription")}
              </p>
            </div>
            <Switch checked={driving} onCheckedChange={setDriving} />
          </div>

          {/* Business profiles */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {t("businessProfiles")}
              </p>
              <p className="text-xs text-gray-400">
                {t("businessProfilesDescription")}
              </p>
            </div>
            <Switch checked={business} onCheckedChange={setBusiness} />
          </div>
        </div>
      </div>
    </div>
  );
}
