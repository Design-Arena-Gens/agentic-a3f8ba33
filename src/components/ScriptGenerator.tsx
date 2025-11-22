import { FormEvent, useMemo, useState } from "react";
import {
  generateScript,
  GeneratedScript,
} from "@/lib/scriptEngine";
import { getHashtags } from "@/lib/hashtags";

type Props = {
  onGenerate: (payload: GeneratedScript & { hashtags: string[] }) => void;
};

const defaultOptions = {
  niche: "business growth",
  benefit: "grow your audience",
  stepOne: "hook viewers with a quick payoff",
  stepTwo: "layer authority with proof or data",
  stepThree: "drop a bold call-to-action",
};

export function ScriptGenerator({ onGenerate }: Props) {
  const [formState, setFormState] = useState(defaultOptions);
  const [currentScript, setCurrentScript] = useState<
    (GeneratedScript & { hashtags: string[] }) | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const hashtags = useMemo(
    () => getHashtags(formState.niche),
    [formState.niche]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);

    const generated = generateScript(formState);
    const payload = { ...generated, hashtags };
    setCurrentScript(payload);
    onGenerate(payload);

    const timer = setTimeout(() => {
      setIsGenerating(false);
      clearTimeout(timer);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-zinc-900">
            Step 2 · AI Scripting
          </h2>
          <p className="text-sm text-zinc-500">
            We remix your niche into viral hooks, structured narration, and
            sharp CTAs tailored for TikTok&apos;s retention curve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
            Niche Focus
            <input
              type="text"
              value={formState.niche}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, niche: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. digital marketing, real estate, beauty tips"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            What result do viewers get?
            <input
              type="text"
              value={formState.benefit}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  benefit: event.target.value,
                }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. increase leads in 7 days"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Step 1
            <input
              type="text"
              value={formState.stepOne}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  stepOne: event.target.value,
                }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Step 2
            <input
              type="text"
              value={formState.stepTwo}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  stepTwo: event.target.value,
                }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Step 3
            <input
              type="text"
              value={formState.stepThree}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  stepThree: event.target.value,
                }))
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </label>

          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={isGenerating}
            >
              {isGenerating ? "Synthesizing..." : "Generate Script"}
            </button>
          </div>
        </form>

        {currentScript && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm text-zinc-700">
            <p className="font-medium uppercase tracking-wide text-zinc-500">
              Hook
            </p>
            <p className="mb-3 text-lg font-semibold text-zinc-900">
              {currentScript.hook}
            </p>
            <p className="font-medium uppercase tracking-wide text-zinc-500">
              Body
            </p>
            <p className="mb-3">{currentScript.body}</p>
            <p className="font-medium uppercase tracking-wide text-zinc-500">
              Call to Action
            </p>
            <p>{currentScript.cta}</p>
          </div>
        )}
      </div>
    </div>
  );
}
