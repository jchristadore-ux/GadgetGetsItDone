import { prisma } from "@/lib/db";

export const metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

export default async function Page() {
  let rows: any[] = [];
  try {
    
    const data = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    rows = data.map((p) => ({ id: p.id, summary: `${p.status} · $${(p.amountCents/100).toFixed(2)}`, updatedAt: p.updatedAt }));

  } catch {}
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-offwhite text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Summary</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="p-3 text-brand-slate" colSpan={3}>No records (seed DB or create via app).</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                <td className="p-3">{r.summary}</td>
                <td className="p-3">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
