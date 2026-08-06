
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

  return (
    <>
      <Navbar />

      {children}

      <Content/>

      <Footer />
    </>
  );
}
