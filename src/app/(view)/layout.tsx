import Footer from "@/components/core/footer";
import Navbar from "@/components/core/navbar";
import OnboardingGate from "@/components/core/onboarding-gate";
import { Button } from "@/components/ui/button";
import { cn, base_api, base_url } from "@/lib/utils";
import { ArrowLeftRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ApiResponse } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { BiSolidBank } from "react-icons/bi";
/* ─── Radial satellite node ─── */

/* ─── Data ─── */
const aboutPoints = [
  "Lorem ipsum dolor sit amet consectetur.",
  "Augue non malesuada placerat faucibus nam purus sem.",
  "Uma pulvinar porttitor dignissim congue pellentesque ac hac.",
  "Eu adipiscing massa ut proin mauris orci tincidunt ac in.",
];

const serviceCards = [
  {
    id: "rc-1",
    title: "Resident Care",
    description:
      "Lorem ipsum dolor sit amet consectetur. Augue non malesuada placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim congue pellentesque ac hac.",
  },
  {
    id: "en-1",
    title: "Elderly Nutrition",
    description:
      "Lorem ipsum dolor sit amet consectetur. Augue non malesuada placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim congue pellentesque ac hac.",
  },
  {
    id: "rc-2",
    title: "Resident Care",
    description:
      "Lorem ipsum dolor sit amet consectetur. Augue non malesuada placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim congue pellentesque ac hac.",
  },
  {
    id: "en-2",
    title: "Elderly Nutrition",
    description:
      "Lorem ipsum dolor sit amet consectetur. Augue non malesuada placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim congue pellentesque ac hac.",
  },
];

/* ─── Page ─── */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      {children}

      {/* ── ABOUT US ── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-34 lg:px-16">
          {/* Image with teal offset border */}
          <div className="relative">
            <div
              className="absolute rounded-2xl border-4 border-primary"
              style={{
                inset: "auto -16px -16px auto",
                width: "calc(100% - 20px)",
                height: "calc(100% - 20px)",
              }}
            />
            <Image
              src="/image/about-image.webp"
              alt="About iBadi — caregiver with elderly person"
              width={540}
              height={460}
              className="relative z-10 w-full rounded-2xl object-cover"
              style={{ aspectRatio: "540/460" }}
            />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl font-bold text-gray-900">About Us</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Lorem ipsum dolor sit amet consectetur. Augue non malesuada
              placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim
              congue pellentesque ac hac.
            </p>
            <ul className="flex flex-col gap-3">
              {aboutPoints.map((pt) => (
                <li
                  key={pt}
                  className="flex items-start gap-2 text-sm text-gray-500"
                >
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  {pt}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button className="rounded-md px-8">Booking</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">
            Our Services
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {serviceCards.map((card, index) => (
              <div
                key={card.id}
                className={cn(
                  "flex gap-4 rounded-xl bg-white p-6",
                  index === 0 && "bg-primary/10 shadow-sm",
                )}
              >
                {/* Teal icon square */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary">
                  {index % 2 === 0 ? (
                    <BiSolidBank className="text-white size-5" />
                  ) : (
                    <ArrowLeftRight className="text-white size-5" />
                  )}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENT REVIEWS ── */}
      <section className="bg-[#eaf7f7] py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">
            Client Reviews
          </h2>

          <div className="mx-auto  rounded-2xl px-8 py-8">
            {/* Opening quote */}
            <div className="mb-4 text-5xl font-black leading-none text-primary">
              &ldquo;
            </div>
            <p className="text-sm leading-7 text-gray-500">
              Lorem ipsum dolor sit amet consectetur. Amet sed tellus elementum
              mauris. Libero maecenas eget tellus morbi diam enim euismod
              egestas. Adipiscing fringilla duis justo adipiscing eget aenean
              sollicitudin. Nibh ut sed sodales magna risus tellus. Nulla ut
              arcu ac bibendum blandit tincidunt ante. Tincidunt libero urna ut
              aliquet vitae nunc quisque sapien cursus.
            </p>
            {/* Closing quote */}
            <div className="mt-2 text-right text-5xl font-black leading-none text-primary">
              &rdquo;
            </div>

            {/* Reviewer */}
            <div className="mt-5 flex items-center gap-3 mx-auto max-w-max">
              <Image
                src="https://i.pravatar.cc/48?u=james"
                alt="James Smith"
                width={44}
                height={44}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  James Smith
                </p>
                <p className="text-xs text-gray-400">ABC Softwares</p>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="size-2.5 rounded-full bg-gray-200" />
              <span className="size-2.5 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST ELDERLY CARE ── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-16">
          {/* Text — left */}
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl font-bold leading-tight text-gray-900">
              The Best Eldery Care
              <br className="hidden sm:block" /> Center For You
            </h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Lorem ipsum dolor sit amet consectetur. Augue non malesuada
              placerat faucibus nam purus sem. Uma pulvinar porttitor dignissim
              congue pellentesque ac hac. Viverra donec nulla-id orci ipsum
              tellus dolor. Eu adipiscing massa ut proin mauris orci tincidunt
              ac in.
            </p>
            <div className="pt-2">
              <Button className="rounded-md px-8">Booking</Button>
            </div>
          </div>

          {/* Image — right */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/image/eldery-image.jpg"
              alt="Elderly care — caregiver assisting senior"
              width={580}
              height={440}
              className="w-full object-cover"
              style={{ aspectRatio: "580/440" }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="container mx-auto px-6 lg:px-16 mb-24">
        <section className="bg-primary p-6">
          <div className="container mx-auto flex flex-col items-start gap-8 px-6 py-8 sm:py-14 sm:flex-row sm:items-center sm:justify-between lg:px-16">
            {/* Left text */}
            <div className="max-w-md">
              <h2 className="mb-3 text-2xl sm:text-3xl font-bold text-white">
                Looking for a Better Care?
              </h2>
              <p className="mb-7 text-xs sm:text-sm leading-relaxed text-white/80">
                Lorem ipsum dolor sit amet consectetur. Augue non malesuada
                placerat faucibus nam purus sem. Uma pulvinar porttitor
                dignissim congue pellentesque ac hac.
              </p>
              <Button
                variant="outline"
                className="border-white bg-white text-primary hover:bg-white/90 hover:text-primary"
                asChild
              >
                <Link href="/service">Booking</Link>
              </Button>
            </div>

            {/* Right — 24/7 badge + paper plane */}
            <div className=" flex relative shrink-0 items-center justify-center">
              {/* Outer dashed ring */}
              <div className="hidden sm:flex size-36 items-center justify-center rounded-full ">
                <Image
                  src="/icons/clock-icon.svg"
                  alt="24/7 support clock"
                  height={128}
                  width={128}
                  className="absolute -inset-4 size-48 -left-36 -top-12 text-white/40"
                />
              </div>
              {/* Paper plane */}
              <Image
                src="/icons/paper-icon.svg"
                alt="Paper plane"
                height={128}
                width={128}
                className="absolute right-0  lg:-right-10 lg:-bottom-36 size-48 text-white/60"
              />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
