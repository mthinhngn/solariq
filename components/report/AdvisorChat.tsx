"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/lib/gemini";
import type { AddressReport } from "@/types";

type AdvisorChatProps = { report: AddressReport };

export function AdvisorChat({ report }: AdvisorChatProps) {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [seededAnswer, setSeededAnswer] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `advisor_seed_${report.address}`;

    async function loadSeed() {
      setSeededAnswer(null);
      setSeedError(null);

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSeededAnswer(cached);
        if (!openRef.current) {
          setHasUnread(true);
        }
        return;
      }

      try {
        const res = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report }),
        });
        const payload = (await res.json()) as {
          answer?: string;
          error?: string;
        };
        if (!res.ok) throw new Error(payload.error ?? "Advisor request failed.");
        if (!payload.answer) throw new Error("Advisor response was empty.");
        if (!cancelled) {
          localStorage.setItem(cacheKey, payload.answer);
          setSeededAnswer(payload.answer);
          if (!openRef.current) {
            setHasUnread(true);
          }
        }
      } catch (e) {
        if (!cancelled)
          setSeedError(e instanceof Error ? e.message : "Unknown error.");
      }
    }

    void loadSeed();
    return () => {
      cancelled = true;
    };
  }, [report]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, sending, seededAnswer, open]);

  // Focus input on open
  useEffect(() => {
    if (open && seededAnswer) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open, seededAnswer]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function togglePanel() {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
      setHasUnread(false);
    }
  }

  async function handleSend() {
    const q = question.trim();
    if (!q || sending) return;

    const userMsg: ChatMessage = { role: "user", text: q };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setQuestion("");
    setSending(true);
    setFollowUpError(null);

    const contextHistory: ChatMessage[] = seededAnswer
      ? [{ role: "assistant", text: seededAnswer }, ...updatedHistory]
      : updatedHistory;

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report,
          question: q,
          history: contextHistory.slice(0, -1),
        }),
      });
      const payload = (await res.json()) as {
        answer?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(payload.error ?? "Follow-up failed.");
      if (!payload.answer) throw new Error("Empty follow-up response.");
      setHistory((prev) => [
        ...prev,
        { role: "assistant", text: payload.answer! },
      ]);
    } catch (e) {
      setFollowUpError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={togglePanel}
        aria-label={open ? "Close advisor" : "Open SolarIQ advisor"}
        aria-expanded={open}
        className="group fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[0_14px_40px_rgba(202,138,4,0.45)] transition-all duration-200 hover:scale-105 hover:shadow-[0_18px_50px_rgba(202,138,4,0.55)] active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-amber-400 opacity-60 blur-md transition group-hover:opacity-80" />
        <span className="relative">
          {open ? (
            <X className="size-6" strokeWidth={2.25} />
          ) : (
            <Sparkles className="size-6" strokeWidth={2} />
          )}
        </span>
        {hasUnread && !open ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative size-3 rounded-full bg-red-500 ring-2 ring-white" />
          </span>
        ) : null}
      </button>

      {/* Chat panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="SolarIQ Advisor"
          className="fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          style={{
            height: "min(600px, calc(100vh - 8rem))",
            animation: "pop-in 0.25s ease-out both",
            transformOrigin: "bottom right",
          }}
        >
          {/* Header with animated gradient */}
          <div
            className="relative overflow-hidden px-5 py-4 text-white"
            style={{
              background:
                "linear-gradient(135deg, #14532d 0%, #166534 45%, #ca8a04 140%)",
              backgroundSize: "200% 200%",
              animation: "gradient-flow 8s ease infinite",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-yellow-300/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">
                  SolarIQ Advisor
                </p>
                <p className="text-xs text-white/70">
                  AI guidance for your home
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50/70 px-4 py-4">
            {/* Seeded answer loading */}
            {!seededAnswer && !seedError ? (
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                  <Sparkles className="size-3.5 text-amber-600" />
                </div>
                <div className="space-y-2 rounded-2xl rounded-tl-sm border border-black/5 bg-white px-3.5 py-3 shadow-sm">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : null}

            {seedError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Advisor unavailable: {seedError}
              </p>
            ) : null}

            {/* Seeded answer */}
            {seededAnswer ? (
              <div
                className="flex gap-2"
                style={{ animation: "fade-up 0.35s ease-out both" }}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                  <Sparkles className="size-3.5 text-amber-600" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white px-3.5 py-2.5 text-sm leading-6 text-zinc-800 shadow-sm">
                  {seededAnswer}
                </div>
              </div>
            ) : null}

            {/* History */}
            {history.map((msg, i) =>
              msg.role === "user" ? (
                <div
                  key={i}
                  className="flex justify-end"
                  style={{ animation: "fade-up 0.3s ease-out both" }}
                >
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-amber-500 to-amber-400 px-3.5 py-2 text-sm leading-5 text-black shadow-sm">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="flex gap-2"
                  style={{ animation: "fade-up 0.3s ease-out both" }}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                    <Sparkles className="size-3.5 text-amber-600" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-black/5 bg-white px-3.5 py-2.5 text-sm leading-6 text-zinc-800 shadow-sm">
                    {msg.text}
                  </div>
                </div>
              ),
            )}

            {/* Typing indicator */}
            {sending ? (
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                  <Sparkles className="size-3.5 text-amber-600" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-black/5 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span
                      className="size-1.5 animate-bounce rounded-full bg-amber-500"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="size-1.5 animate-bounce rounded-full bg-amber-500"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="size-1.5 animate-bounce rounded-full bg-amber-500"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {followUpError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {followUpError}
              </p>
            ) : null}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-black/5 bg-white px-3 py-3">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                className="h-10 min-w-0 flex-1 rounded-full border-black/10 bg-zinc-50 px-4 text-sm text-zinc-900 caret-amber-600 placeholder:text-zinc-400"
                placeholder={
                  seededAnswer ? "Ask a follow-up..." : "Preparing advisor..."
                }
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend();
                }}
                disabled={sending || !seededAnswer}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void handleSend()}
                disabled={sending || !question.trim() || !seededAnswer}
                className="size-10 shrink-0 rounded-full"
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
