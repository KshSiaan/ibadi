
import Footer from "@/components/core/footer";
import Navbar from "@/components/core/navbar";

import { getTranslations } from "next-intl/server";
import Content from "./content";

/* ─── Page ─── */
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("HomeLayout");

  const aboutPoints = [
    t("aboutPoint1"),
    t("aboutPoint2"),
    t("aboutPoint3"),
    t("aboutPoint4"),
  ];

  const serviceCards = [
    {
      id: "rc-1",
      title: t("serviceCard1Title"),
      description: t("serviceCard1Description"),
    },
    {
      id: "en-1",
      title: t("serviceCard2Title"),
      description: t("serviceCard2Description"),
    },
    {
      id: "rc-2",
      title: t("serviceCard3Title"),
      description: t("serviceCard3Description"),
    },
    {
      id: "en-2",
      title: t("serviceCard4Title"),
      description: t("serviceCard4Description"),
    },
  ];

  return (
    <>
      <Navbar />

      {children}

      <Content/>

      <Footer />
    </>
  );
}
