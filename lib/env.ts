function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => value && value.trim().length > 0);
}

export function getSupabaseUrl() {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  );
}

export function getSupabaseAnonKey() {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
  );
}

export function getGeminiApiKey() {
  return firstDefined(
    process.env.GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  );
}

export function getGoogleMapsApiKey() {
  return firstDefined(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    process.env.GOOGLE_MAPS_API_KEY,
  );
}

export function getGoogleSolarApiKey() {
  return firstDefined(
    process.env.GOOGLE_SOLAR_API_KEY,
    process.env.GOOGLE_MAPS_API_KEY,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  );
}

export function isPlaceholder(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("your_") ||
    normalized.includes("_here") ||
    normalized.includes("placeholder")
  );
}
