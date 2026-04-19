"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { demoAddresses } from "@/lib/demo-addresses";

type GeocodeResponse = {
  formattedAddress: string;
  lat: number;
  lng: number;
};

export function LandingSearchForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError("Enter an address to continue.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: trimmedAddress }),
      });

      const payload = (await response.json()) as
        | GeocodeResponse
        | { error?: string };

      if (!response.ok || !("lat" in payload) || !("lng" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Unable to geocode that address.",
        );
      }

      const searchParams = new URLSearchParams({
        address: payload.formattedAddress,
        lat: String(payload.lat),
        lng: String(payload.lng),
      });

      router.push(`/results?${searchParams.toString()}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while looking up that address.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[26px] border border-white/8 bg-black/18 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md sm:flex-row sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200">
            <MapPin className="size-5" strokeWidth={1.8} />
          </div>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter your home address"
            autoComplete="off"
            className="h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
            aria-label="Address"
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-2xl border border-cyan-300/18 bg-[linear-gradient(135deg,#54d6ff,#7b8cff)] px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_36px_rgba(84,214,255,0.24)] hover:brightness-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scanning..." : "Build report"}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 px-1">
          {demoAddresses.map((demo) => (
            <button
              key={demo.address}
              type="button"
              onClick={() => {
                setAddress(demo.address);
                setError(null);
              }}
              className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-1.5 text-left text-xs font-medium text-white/68 transition hover:border-cyan-300/28 hover:bg-cyan-300/10 hover:text-white"
            >
              {demo.address}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 px-1 text-xs text-white/46">
          <p>Uses live geocoding, satellite roof modeling, and local permit history.</p>
          <p className="hidden font-mono uppercase tracking-[0.22em] text-cyan-200/76 sm:block">
            No signup
          </p>
        </div>
      </div>
      {error ? (
        <p className="mt-3 px-1 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
