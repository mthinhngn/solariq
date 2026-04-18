"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type LandingSearchFormProps = {
  permitRecordCount: number;
};

type GeocodeResponse = {
  formattedAddress: string;
  lat: number;
  lng: number;
};

export function LandingSearchForm({
  permitRecordCount,
}: LandingSearchFormProps) {
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter your home address"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-black/30"
          aria-label="Address"
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-xl px-6 text-sm font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Looking up..." : "See solar potential"}
        </Button>
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Built on {permitRecordCount.toLocaleString()} real permit records
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
