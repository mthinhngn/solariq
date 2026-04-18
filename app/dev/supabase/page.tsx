import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    table?: string;
  }>;
};

export default async function DevSupabasePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const table = params.table || "installations";
  let data: unknown[] | null = null;
  let errorMessage: string | null = null;

  try {
    const supabase = getSupabaseClient();
    const result = await supabase.from(table).select("*").limit(5);
    data = result.data;
    errorMessage = result.error?.message ?? null;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unknown Supabase failure.";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            0.8 Supabase
          </p>
          <h1 className="text-3xl font-semibold">SELECT * LIMIT 5</h1>
          <p className="text-sm text-slate-300">
            Table: <code>{table}</code>
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            Query failed: {errorMessage}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Query succeeded. Open browser devtools if you also want to inspect
            the console during local development.
          </div>
        )}

        <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200">
          {JSON.stringify(
            {
              table,
              rowsReturned: data?.length ?? 0,
              data,
              error: errorMessage,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </main>
  );
}
