"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silent fail
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => void handleShare()}
      className="gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
    >
      {copied ? (
        <Check className="size-3.5" />
      ) : (
        <Share2 className="size-3.5" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
