"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCookies } from "react-cookie";

type View = "role" | "register" | "login";

const navLinks = [
  { label: "Bookings", href: "/profile/payments/bookings" },
  { label: "Services", href: "/service" },
  { label: "Calendar", href: "/inbox" },
  { label: "Payments", href: "/profile/payments" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/profile/personal-details" },
  { label: "Support", href: "/profile" },
];
const professionalNavLinks = [
  { label: "Calendar", href: "/professional/calendar" },
  { label: "Services", href: "/professional" },
  { label: "Availability", href: "/professional/request" },
  { label: "Payments", href: "/profile/payments" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/profile/personal-details" },
  { label: "Support", href: "/inbox" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [cookies, , removeCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "user",
  ]);
  const router = useRouter();
  const isLoggedIn = !!cookies.accessToken;
  const user = cookies.user as
    | { name?: string; profile?: string; role?: string }
    | undefined;

  const handleSignOut = () => {
    removeCookie("accessToken", { path: "/" });
    removeCookie("refreshToken", { path: "/" });
    removeCookie("user", { path: "/" });
    router.push("/");
  };

  const isProvider = isLoggedIn && user?.role === "service_provider";
  const links = isProvider ? professionalNavLinks : navLinks;
  const activeColor = isProvider ? "text-cyan-600" : "text-primary";
  const hoverColor = isProvider ? "hover:text-cyan-600" : "hover:text-primary";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-16">
        <Link href="/" className="text-2xl font-bold">
          {isProvider ? (
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
          {links.slice(0, 4).map((link) => (
            <Link
              key={link.label}
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
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage
                    src={user?.profile ?? ""}
                    alt={user?.name ?? ""}
                  />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-red-300 text-red-500 hover:bg-red-50"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <AuthDialog
                defaultView="login"
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
                defaultView="role"
                trigger={
                  <Button size="sm" className="rounded-md px-5">
                    Create Account
                  </Button>
                }
              />
            </>
          )}
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
              key={link.label}
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
          {isLoggedIn ? (
            <div className="mt-4 flex items-center justify-between px-3 py-2">
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage
                    src={user?.profile ?? ""}
                    alt={user?.name ?? ""}
                  />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-red-300 text-red-500 hover:bg-red-50"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <AuthDialog
                defaultView="login"
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
                defaultView="role"
                trigger={
                  <Button size="sm" className="rounded-md px-5">
                    Create Account
                  </Button>
                }
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export function AuthDialog({
  trigger,
  defaultView = "role",
}: {
  trigger: React.ReactNode;
  defaultView?: View;
}) {
  const [view, setView] = useState<View>(defaultView);
  const [role, setRole] = useState<"user" | "service_provider">("user");

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-112.5">
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
                onClick={() => {
                  setRole("user");
                  setView("register");
                }}
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
                onClick={() => {
                  setRole("service_provider");
                  setView("register");
                }}
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
          <div className="flex flex-col gap-6 p-4 text-center">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-gray-500">
              {role === "service_provider"
                ? "Set up your service provider account"
                : "Sign up to book services on iBadi"}
            </p>
            <Button className="w-full" asChild>
              <Link href={`/auth/register?role=${role}`}>Create Account</Link>
            </Button>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                className="font-bold text-primary"
                onClick={() => setView("login")}
              >
                Log in
              </button>
            </p>
          </div>
        )}

        {/* VIEW 3: Login */}
        {view === "login" && (
          <div className="flex flex-col gap-4 p-4">
            <h2 className="text-2xl font-bold">Log in</h2>
            {/* <Button variant="outline" className="w-full">
              Continue with Apple
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Continue with Facebook
            </Button> */}
            {/* <Button variant="outline" className="w-full">
              <FcGoogle />
              Continue with Google
            </Button>
            <div className="my-2 flex items-center gap-4 text-gray-400">
              <div className="h-px flex-1 bg-gray-200" /> or{" "}
              <div className="h-px flex-1 bg-gray-200" />
            </div> */}
            <Button className="w-full" asChild>
              <Link href="/auth/login">Log in with email</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
