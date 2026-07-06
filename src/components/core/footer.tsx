import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("Footer");

  const footerLinks = [
    { label: t("home"), href: "/" },
    { label: t("service"), href: "/service" },
    { label: t("favourites"), href: "/favourite" },
    { label: t("inbox"), href: "/inbox" },
    { label: t("profile"), href: "/profile" },
  ];

  return (
    <footer className="bg-[#1e2330] text-white">
      <div className="container mx-auto px-6 py-12 lg:px-16">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">i</span>
            <span className="text-white">Badi</span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-white/40">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
