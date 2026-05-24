"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  EllipsisVertical,
  Image as ImageIcon,
  MinusCircle,
  Phone,
  Send,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Message = {
  id: number;
  text: string;
  time: string;
  sender: "me" | "other";
};

const initialMessages: Message[] = [
  { id: 1, text: "Hello", time: "3:00 pm", sender: "me" },
  { id: 2, text: "How can we help you", time: "3:01 pm", sender: "other" },
  {
    id: 3,
    text: "I need a emergency appointment.......... are you available now.",
    time: "3:01 pm",
    sender: "me",
  },
  {
    id: 4,
    text: "Yes we are available for you , at first book an appointment and come , you can use google map also if you have any problem.",
    time: "3:02 pm",
    sender: "other",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, time, sender: "me" },
    ]);
    setInput("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex min-h-dvh flex-col container mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center text-gray-700"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex flex-col items-center">
          <Avatar className="size-9">
            <AvatarImage
              src="https://i.pravatar.cc/40?u=admin-maria"
              alt="Admin Maria"
            />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-gray-700">
            Admin Maria
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              alert("this functionality will be implemented in integration")
            }
            className="flex size-9 items-center justify-center text-primary"
          >
            <VideoIcon className="size-6" />
          </button>
          <button
            type="button"
            onClick={() =>
              alert("this functionality will be implemented in integration")
            }
            className="flex size-9 items-center justify-center text-primary"
          >
            <Phone className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex size-9 items-center justify-center text-primary"
          >
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
        <p className="text-center text-xs text-gray-400">Today</p>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.sender === "me" ? "justify-end" : "items-end gap-2",
            )}
          >
            {msg.sender === "other" && (
              <Avatar className="size-8 shrink-0">
                <AvatarImage
                  src="https://i.pravatar.cc/40?u=admin-maria"
                  alt="Admin Maria"
                />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-[65%] rounded-2xl px-4 py-2.5",
                msg.sender === "me"
                  ? "rounded-br-sm bg-primary text-white"
                  : "rounded-bl-sm bg-white text-gray-800",
              )}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p
                className={cn(
                  "mt-1 text-right text-[10px]",
                  msg.sender === "me" ? "text-white/70" : "text-gray-400",
                )}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
          <input
            type="text"
            placeholder="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <ImageIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={sendMessage}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-90"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-xs gap-0 p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            User Setting
          </p>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setBlockOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <MinusCircle className="size-4" />
            Block this user
          </button>
        </DialogContent>
      </Dialog>

      {/* Block confirm dialog */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="max-w-xs gap-0 p-6 text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Block
          </p>
          <p className="mb-6 text-base font-bold text-gray-800">
            Are you sure you want to Block this User?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setBlockOpen(false)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              Yes, Block
            </button>
            <button
              type="button"
              onClick={() => setBlockOpen(false)}
              className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700"
            >
              No, Don&apos;t Block
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
