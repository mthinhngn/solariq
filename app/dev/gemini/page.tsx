import { runGeminiSmokeTest } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export default async function DevGeminiPage() {
  let text = "";
  let errorMessage: string | null = null;

  try {
    text = await runGeminiSmokeTest();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unknown Gemini failure.";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p
            className={`text-sm uppercase tracking-[0.3em] ${
              errorMessage ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            0.10 Gemini
          </p>
          <h1 className="text-3xl font-semibold">
            {errorMessage ? "Gemini check failed" : "Text returned"}
          </h1>
        </div>

        <div
          className={`rounded-2xl border p-4 text-sm ${
            errorMessage
              ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {errorMessage ?? text}
        </div>
      </div>
    </main>
  );
}
