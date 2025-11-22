"use client";

import { useState } from "react";
import {
  ImageUploader,
  UploadedImage,
} from "@/components/ImageUploader";
import {
  ScriptGenerator,
} from "@/components/ScriptGenerator";
import {
  VideoComposer,
  GeneratedVideo,
} from "@/components/VideoComposer";
import { TikTokPublisherForm } from "@/components/TikTokPublisherForm";
import { ContentPlanner } from "@/components/ContentPlanner";
import type { GeneratedScript } from "@/lib/scriptEngine";

type ScriptPayload = GeneratedScript & { hashtags: string[] };

export default function Home() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [script, setScript] = useState<ScriptPayload | null>(null);
  const [video, setVideo] = useState<GeneratedVideo | null>(null);

  const handleImageChange = (payload: UploadedImage | null) => {
    setImage(payload);
    setVideo(null);
  };

  const handleScript = (payload: ScriptPayload) => {
    setScript(payload);
    setVideo(null);
  };

  const handleVideoReady = (payload: GeneratedVideo | null) => {
    setVideo(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-24">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Agentic TikTok Growth Stack
            </span>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Automate daily TikTok drops from a single portrait and print
              audience growth while you sleep.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Upload your hero image once. Our pipeline scripts, animates,
              renders, and schedules profit-focused TikToks so your face is
              posting 24/7 without you lifting a finger.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <Stat label="Average Watch Boost" value="+47%" accent="text-emerald-500" />
            <Stat label="Posting Cadence" value="3.4x/day" accent="text-blue-500" />
            <Stat label="Creator Profit Stories" value="128 this month" accent="text-violet-500" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-10">
        <ImageUploader onChange={handleImageChange} />
        <ScriptGenerator onGenerate={handleScript} />
        <VideoComposer image={image} script={script} onVideoReady={handleVideoReady} />
        <TikTokPublisherForm video={video} />
        <ContentPlanner />

        <footer className="mt-12 rounded-3xl border border-slate-200 bg-white/80 p-8 text-sm text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">
            Deployment Checklist
          </h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Connect your TikTok for Business account and copy the access token
              into the publisher above.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              Render at least three evergreen promos so the scheduler can rotate
              offers across the week.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
              Revisit the planner daily to mark posted content and adjust CTAs
              toward the highest converting lead magnets.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              Watch analytics for completion rate and iterate your hook matrix
              using the AI scripting tool.
            </li>
          </ul>
        </footer>
      </main>
    </div>
  );
}

type StatProps = {
  label: string;
  value: string;
  accent: string;
};

function Stat({ label, value, accent }: StatProps) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
