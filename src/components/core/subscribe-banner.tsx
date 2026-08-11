import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CheckCircleIcon, LockIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function SubscribeBanner() {
  return (
    <div className="absolute bg-white/20 h-full w-full backdrop-blur-xs top-0 left-0 z-30 flex justify-center items-center">
      <Card className="w-md!">
        <CardContent className="space-y-4">
          <div className="size-14 rounded-full text-primary mx-auto flex justify-center items-center bg-accent">
            <LockIcon />
          </div>
          <h2 className="text-2xl font-semibold text-center">
            Unlock This Request
          </h2>
          <p>
            Subscribe to view this complete request, connect with the customer,
            and grow your business on IUMI.
          </p>
          <div className="px-2 space-y-3">
            <div className="space-x-3 flex justify-start items-start">
              <CheckCircleIcon className="text-primary size-5" />
              <p>Access to new customer requests </p>
            </div>
            <div className="space-x-3 flex justify-start items-start">
              <CheckCircleIcon className="text-primary size-5" />
              <p>Chat with customers </p>
            </div>
            <div className="space-x-3 flex justify-start items-start">
              <CheckCircleIcon className="text-primary size-5" />
              <p>Manage Bookings from your calendar </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/profile/subscription">Choose a subscription</Link>
          </Button>
          <CardDescription className="text-center text-xs text-gray-500">
            Your request will automatically unlock after you subscribe.
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
