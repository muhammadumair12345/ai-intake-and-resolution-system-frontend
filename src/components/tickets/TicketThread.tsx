"use client";

import { Message } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { User, ShieldCheck, Mail } from "lucide-react";
import { useEffect, useRef } from "react";

interface TicketThreadProps {
  messages: Message[];
  currentUserId?: string;
  guestMode?: boolean;
}

export function TicketThread({
  messages,
  currentUserId,
  guestMode,
}: TicketThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isMe = guestMode
            ? message.senderType === "GUEST"
            : message.senderId === currentUserId;

          const isSystem = message.senderType === "SYSTEM";

          return (
            <div
              key={message.id}
              className={cn(
                "flex w-full max-w-[85%] flex-col gap-1",
                isMe ? "ml-auto items-end" : "items-start",
                isSystem && "mx-auto max-w-[95%] items-center"
              )}
            >
              {isSystem ? (
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {message.content}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {message.senderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatRelativeTime(message.createdAt)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-background border rounded-tl-none"
                    )}
                  >
                    {message.content}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
