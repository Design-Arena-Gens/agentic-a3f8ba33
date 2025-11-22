import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "draft" | "rendered" | "scheduled" | "posted";

export type PlannedPost = {
  id: string;
  idea: string;
  hook: string;
  cta: string;
  status: Status;
  scheduleAt?: string;
  notes?: string;
};

const storageKey = "agentic-tiktok-planner";

const statusLabels: Record<Status, string> = {
  draft: "Draft",
  rendered: "Rendered",
  scheduled: "Scheduled",
  posted: "Posted",
};

const statusStyles: Record<Status, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  rendered: "bg-sky-100 text-sky-700",
  scheduled: "bg-amber-100 text-amber-700",
  posted: "bg-emerald-100 text-emerald-700",
};

type PlannerForm = {
  idea: string;
  hook: string;
  cta: string;
  scheduleAt: string;
  notes: string;
};

const defaultFormState = (): PlannerForm => {
  const nextSlot = new Date();
  nextSlot.setHours(nextSlot.getHours() + 6);
  nextSlot.setMinutes(0, 0, 0);
  return {
    idea: "",
    hook: "",
    cta: "",
    scheduleAt: nextSlot.toISOString().slice(0, 16),
    notes: "",
  };
};

export function ContentPlanner() {
  const [items, setItems] = useState<PlannedPost[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      return JSON.parse(raw) as PlannedPost[];
    } catch (error) {
      console.error("Failed to parse planner cache", error);
      return [];
    }
  });
  const [form, setForm] = useState(defaultFormState);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const metrics = useMemo(() => {
    const total = items.length;
    const scheduled = items.filter((item) => item.status === "scheduled").length;
    const posted = items.filter((item) => item.status === "posted").length;
    const cadence =
      total && items.some((item) => item.scheduleAt)
        ? `${Math.round((total / 7) * 10) / 10}/day`
        : "Plan more drops";

    return { total, scheduled, posted, cadence };
  }, [items]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const entry: PlannedPost = {
      id: crypto.randomUUID(),
      idea: form.idea,
      hook: form.hook,
      cta: form.cta,
      scheduleAt: form.scheduleAt,
      notes: form.notes,
      status: "draft",
    };

    setItems((prev) => [entry, ...prev]);
    setForm(defaultFormState);
  };

  const updateStatus = (id: string, status: Status) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const deleteEntry = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-zinc-900">
            Step 5 · Daily Earnings Planner
          </h2>
          <p className="text-sm text-zinc-500">
            Map your idea queue, track rendering progress, and lock in the next
            profitable drop.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <MetricCard label="Ideas in Pipeline" value={metrics.total.toString()} />
          <MetricCard label="Scheduled Posts" value={metrics.scheduled.toString()} />
          <MetricCard label="Published This Week" value={metrics.posted.toString()} />
          <MetricCard label="Projected Cadence" value={metrics.cadence} />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Offer or Hook Idea
            <input
              type="text"
              value={form.idea}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, idea: event.target.value }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. 3 lead magnets that print cash"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Scroll-Stopping Hook
            <input
              type="text"
              value={form.hook}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, hook: event.target.value }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. I make $540/day while doing nothing"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Call to Action
            <input
              type="text"
              value={form.cta}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, cta: event.target.value }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. Comment 'START' for the blueprint"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Scheduled Drop
            <input
              type="datetime-local"
              value={form.scheduleAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, scheduleAt: event.target.value }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              rows={3}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Angles, offers, reminders..."
            />
          </label>

          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Add to Planner
          </button>
        </form>

        {items.length ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50/80 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Idea</th>
                  <th className="px-4 py-3 text-left font-medium">Hook</th>
                  <th className="px-4 py-3 text-left font-medium">CTA</th>
                  <th className="px-4 py-3 text-left font-medium">Schedule</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 text-zinc-800">{item.idea}</td>
                    <td className="px-4 py-3 text-zinc-800">{item.hook}</td>
                    <td className="px-4 py-3 text-zinc-800">{item.cta}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.scheduleAt
                        ? new Date(item.scheduleAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {(["draft", "rendered", "scheduled", "posted"] as Status[]).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(item.id, status)}
                              className={`rounded-full border px-3 py-1 transition ${
                                item.status === status
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                              }`}
                              type="button"
                            >
                              {statusLabels[status]}
                            </button>
                          )
                        )}
                        <button
                          onClick={() => deleteEntry(item.id)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 hover:bg-rose-50"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            Start mapping your video queue. High frequency + high intent CTAs =
            daily payouts.
          </div>
        )}
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}
