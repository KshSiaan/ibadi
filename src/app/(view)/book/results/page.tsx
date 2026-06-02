"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useServiceBooking } from "@/lib/store/service-booking";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const serviceQuestions = [
  "How does it work?",
  "Can they perform other tasks besides caregiving?",
  "Does it include care for people with medical conditions?",
  "The person to be cared for is in the hospital",
  "Can I book the service on a weekly basis?",
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

export default function ResultsPage() {
  const router = useRouter();
  const { selectedService } = useServiceBooking();
  const [faqOpen, setFaqOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex min-h-dvh container mx-auto flex-col">
      {/* Filter Panel */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="mx-auto flex max-w-lg items-center justify-between border-b border-gray-100 px-4 py-4">
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
              onClick={() => setFilterOpen(false)}
              className="text-sm font-semibold text-gray-700"
            >
              Clear filters
            </button>
          </div>
          <div className="mx-auto max-w-lg px-6 py-8">
            <Link href="/book/filter" className="text-primary font-semibold">
              Go to filter page
            </Link>
          </div>
        </div>
      )}

      {/* FAQ Dialog */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-sm gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-base font-semibold text-gray-800">
              How does the {selectedService} service work?
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
          <Link href="/book" className="shrink-0 text-primary">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex flex-1 items-center rounded-xl bg-gray-100 px-3 py-2">
            <span className="flex-1 text-sm text-gray-700">
              {selectedService}
            </span>
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
