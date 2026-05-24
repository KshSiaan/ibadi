"use client";

import { Eye, EyeOff, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type View = "role" | "register" | "login";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Service", href: "/service" },
  { label: "Favourite", href: "/favourite" },
  { label: "Inbox", href: "/inbox" },
  { label: "Profile", href: "/profile" },
];
const professionalNavLinks = [
  { label: "Calendar", href: "/professional/calendar" },
  { label: "Notification", href: "/professional/notification" },
  { label: "Request", href: "/professional/request" },
  { label: "Inbox", href: "/inbox" },
  { label: "Profile", href: "/profile" },
];

export default function Navbar({ professional }: { professional?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = professional ? professionalNavLinks : navLinks;
  const activeColor = professional ? "text-cyan-600" : "text-primary";
  const hoverColor = professional
    ? "hover:text-cyan-600"
    : "hover:text-primary";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-16">
        <Link href="/" className="text-2xl font-bold">
          {professional ? (
            <>
              <span className="text-primary">i</span>
              <span className="text-cyan-800">Badi</span>
            </>
          ) : (
            <>
              <span className="text-cyan-800">i</span>
              <span className="text-primary">Badi</span>
            </>
          )}
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(link.href)
                  ? activeColor
                  : `text-gray-600 ${hoverColor}`,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AuthDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-primary text-primary"
              >
                Log In
              </Button>
            }
          />
          <AuthDialog
            trigger={
              <Button size="sm" className="rounded-md px-5">
                Create Account
              </Button>
            }
          />
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-gray-500 hover:text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 border-t border-gray-100 bg-white px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                isActive(link.href)
                  ? activeColor
                  : `text-gray-600 hover:bg-gray-50 ${hoverColor}`,
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className=" grid grid-cols-2 gap-3 mt-4">
            <AuthDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md border-primary text-primary"
                >
                  Log In
                </Button>
              }
            />
            <AuthDialog
              trigger={
                <Button size="sm" className="rounded-md px-5">
                  Create Account
                </Button>
              }
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function AuthDialog({ trigger }: { trigger: React.ReactNode }) {
  const [view, setView] = useState<View>("role");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        {/* VIEW 1: Role Selection */}
        {view === "role" && (
          <div className="flex flex-col gap-6 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                What will you do on iBadi?
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                This decision is not final. You can later be both a client and a
                professional from the account if you wish.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView("register")}
                className="group flex items-center gap-4 rounded-xl border p-4 transition hover:border-primary"
              >
                <div className="h-16 w-24 rounded-lg bg-gray-200" />{" "}
                {/* Placeholder for image */}
                <div className="text-left">
                  <div className="font-semibold">Book a service</div>
                  <div className="text-xs text-gray-400">(I'm a Client)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setView("register")}
                className="group flex items-center gap-4 rounded-xl border p-4 transition hover:border-primary"
              >
                <div className="h-16 w-24 rounded-lg bg-gray-200" />{" "}
                {/* Placeholder for image */}
                <div className="text-left">
                  <div className="font-semibold">Offer Services</div>
                  <div className="text-xs text-gray-400">
                    (I'm a Professional)
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Create Account */}
        {view === "register" && (
          <div className="flex flex-col gap-6 p-4">
            <h2 className="text-2xl font-bold">Create account</h2>
            <div className="flex flex-col gap-4">
              <Input placeholder="Full name" />
              <Input type="email" placeholder="Email" />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button className="w-full bg-teal-500 hover:bg-teal-600">
              Create Account
            </Button>
            <p className="text-center text-sm">
              Do you have an account?{" "}
              {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
              {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <span
                className="cursor-pointer font-bold text-teal-600"
                onClick={() => setView("login")}
              >
                Log in
              </span>
            </p>
          </div>
        )}

        {/* VIEW 3: Login */}
        {view === "login" && (
          <div className="flex flex-col gap-4 p-4">
            <h2 className="text-2xl font-bold">Log in</h2>
            <Button variant="outline" className="w-full">
              Continue with Apple
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Continue with Facebook
            </Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
            <div className="my-2 flex items-center gap-4 text-gray-400">
              <div className="h-px flex-1 bg-gray-200" /> or{" "}
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <Button variant="outline" className="w-full">
              Log in with email
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
