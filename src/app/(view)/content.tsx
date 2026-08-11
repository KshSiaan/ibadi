"use client";
import { howl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ArrowLeftRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BiSolidBank } from "react-icons/bi";
import ClientReviews from "@/components/core/client-reviews";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
export default function Content() {
  const { data, isPending } = useQuery({
    queryKey: ["content"],
    queryFn: async (): Promise<{
      success: boolean;
      message: string;
      data: {
        id: string;
        image: string;
        title: string;
        content: string;
        buttonText: string;
        buttonLink: string;
        createdAt: string;
        updatedAt: string;
      }[];
    }> => {
      return howl(`/contents/web-about-us`);
    },
  });
  const t = useTranslations("HomeLayout");

  const { data: getServiceData, isPending: getServicePending } = useQuery({
    queryKey: ["service"],
    queryFn: async (): Promise<any> => {
      return howl(`/services`);
    },
  });

  // const serviceCards = [
  //   {
  //     id: "rc-1",
  //     title: t("serviceCard1Title"),
  //     description: t("serviceCard1Description"),
  //   },
  //   {
  //     id: "en-1",
  //     title: t("serviceCard2Title"),
  //     description: t("serviceCard2Description"),
  //   },
  //   {
  //     id: "rc-2",
  //     title: t("serviceCard3Title"),
  //     description: t("serviceCard3Description"),
  //   },
  //   {
  //     id: "en-2",
  //     title: t("serviceCard4Title"),
  //     description: t("serviceCard4Description"),
  //   },
  // ];

  const serviceCards = getServiceData?.data?.data?.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.image,
  }));

  return (
    <>
      {/* <div>
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <><pre className='bg-gradient-to-br max-h-[80dvh] overflow-scroll fixed top-1/2 left-1/2 -translate-1/2 w-[90dvw] z-50 from-zinc-900/60 via-zinc-800/40 to-zinc-900/20 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700/20'>
        <code className='whitespace-pre-wrap'>
        {JSON.stringify(data , null , 2)}
        </code>
        </pre></>
      )}
    </div> */}
      {data?.data?.map((item) => (
        <section className="py-16 md:py-24" key={item.id}>
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
                src={item?.image}
                alt="About iBadi — caregiver with elderly person"
                width={540}
                height={460}
                className="relative z-10 w-full rounded-2xl object-cover"
                style={{ aspectRatio: "540/460" }}
              />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-5">
              <h2 className="text-4xl font-bold text-gray-900">
                {item?.title}
              </h2>
              <p
                className="text-sm leading-relaxed text-gray-500"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                dangerouslySetInnerHTML={{
                  __html: item?.content ?? "",
                }}
              />

              {/* <ul className="flex flex-col gap-3">
              {aboutPoints.map((pt) => (
                <li
                  key={pt}
                  className="flex items-start gap-2 text-sm text-gray-500"
                >
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  {pt}
                </li>
              ))}
            </ul> */}
              <div className="pt-2">
                <Button className="rounded-md px-8" asChild>
                  <Link href={item?.buttonLink}>{item?.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── OUR SERVICES ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">
            {t("ourServices")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {serviceCards?.map((card: any, index: number) => (
              <div
                key={card.id}
                className={cn(
                  "flex gap-4 rounded-xl bg-white p-6",
                  index === 0 && "bg-primary/10 shadow-sm",
                )}
              >
                {/* Teal icon square */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary">
                  {/* {index % 2 === 0 ? (
                    <BiSolidBank className="text-white size-5" />
                  ) : (
                    <ArrowLeftRight className="text-white size-5" />
                  )} */}
                  <Image
                    src={card?.image ?? "/icons/service-icon.svg"}
                    alt={`Service ${index + 1} icon`}
                    width={34}
                    className="size-5"
                    height={34}
                  />
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
            {t("clientReviews")}
          </h2>
          <ClientReviews />
        </div>
      </section>

      {/* ── BEST ELDERLY CARE ── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-16">
          {/* Text — left */}
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl font-bold leading-tight text-gray-900">
              {t("bestElderlyCareTitle")}
              <br className="hidden sm:block" />{" "}
              {t("bestElderlyCareTitleLine2")}
            </h2>
            <p className="text-sm leading-relaxed text-gray-500">
              {t("bestElderlyCareDescription")}
            </p>
            <div className="pt-2">
              <Button className="rounded-md px-8">{t("booking")}</Button>
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
                {t("lookingForBetterCare")}
              </h2>
              <p className="mb-7 text-xs sm:text-sm leading-relaxed text-white/80">
                {t("lookingForBetterCareDescription")}
              </p>
              <Button
                variant="outline"
                className="border-white bg-white text-primary hover:bg-white/90 hover:text-primary"
                asChild
              >
                <Link href="/service">{t("booking")}</Link>
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
    </>
  );
}
