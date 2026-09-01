"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { howl } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

const supportSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required"),
  message: z.string().trim().min(1, "Message is required"),
});

type SupportForm = z.infer<typeof supportSchema>;

const initialForm: SupportForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Page() {
  const [form, setForm] = React.useState<SupportForm>(initialForm);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof SupportForm, string>>
  >({});

  const { mutate, isPending, isSuccess } = useMutation({
    mutationKey: ["support-admin"],

    mutationFn: (data: SupportForm) => {
      return howl("/support-message", {
        method: "POST",
        body: data,
      });
    },

    onError: (error) => {
      toast.error(error.message || "Failed to send your message.");
    },

    onSuccess: (res: any) => {
      toast.success(res?.message || "Your message has been sent successfully.");
      setForm(initialForm);
      setErrors({});
    },
  });

  const updateField = <K extends keyof SupportForm>(
    field: K,
    value: SupportForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear the error as soon as the user starts correcting the field.
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = supportSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SupportForm, string>> = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SupportForm;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    mutate(validation.data);
  };

  return (
    <main className="min-h-dvh w-full bg-muted/30 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="">
            <Button variant="outline" asChild>
              <Link href="/">
                <ChevronLeft />
                Go back
              </Link>
            </Button>
          </div>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Iumi Admin Support
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Have a question or need assistance? Send us a message and
              we&apos;ll get back to you.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>

              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isPending}
                aria-invalid={!!errors.name}
              />

              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={isPending}
                aria-invalid={!!errors.email}
              />

              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>

              <Input
                id="subject"
                name="subject"
                placeholder="What can we help you with?"
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                disabled={isPending}
                aria-invalid={!!errors.subject}
              />

              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Your message</Label>

              <Textarea
                id="message"
                name="message"
                placeholder="Describe your issue or question..."
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                disabled={isPending}
                aria-invalid={!!errors.message}
                className="min-h-36 resize-none"
              />

              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isSuccess}
            >
              {isPending
                ? "Sending..."
                : isSuccess
                  ? "Message Sent"
                  : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
