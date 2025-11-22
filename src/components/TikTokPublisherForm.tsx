import { FormEvent, useEffect, useMemo, useState } from "react";
import type { GeneratedVideo } from "./VideoComposer";

type Props = {
  video: GeneratedVideo | null;
};

type PublishState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

const defaultSchedule = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
};

export function TikTokPublisherForm({ video }: Props) {
  const [accessToken, setAccessToken] = useState("");
  const [tiktokUserId, setTiktokUserId] = useState("");
  const [caption, setCaption] = useState("");
  const [scheduleTime, setScheduleTime] = useState(defaultSchedule);
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [state, setState] = useState<PublishState>({ status: "idle" });

  useEffect(() => {
    if (video) {
      setCaption(video.caption);
    }
  }, [video]);

  const formattedCaption = useMemo(() => {
    if (!video) return caption;
    if (!autoHashtags) return caption;

    const filteredTags = video.hashtags.filter(
      (tag) => !caption.toLowerCase().includes(tag.replace("#", "").toLowerCase())
    );
    return `${caption.trim()} ${filteredTags.join(" ")}`.trim();
  }, [caption, autoHashtags, video]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!video || !accessToken || !tiktokUserId) return;

    setState({ status: "uploading" });
    try {
      const formData = new FormData();
      formData.append("accessToken", accessToken);
      formData.append("tiktokUserId", tiktokUserId);
      formData.append("caption", formattedCaption);
      formData.append("scheduleTime", scheduleTime);
      formData.append("fileName", video.fileName.replace(/\.webm$/, ".mp4"));
      formData.append("video", video.blob, video.fileName);

      const response = await fetch("/api/tiktok/publish", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "TikTok publish failed");
      }

      setState({
        status: "success",
        reference: payload.publishId ?? "submitted",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      setState({ status: "error", message });
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-zinc-900">
            Step 4 · TikTok Deployment
          </h2>
          <p className="text-sm text-zinc-500">
            Connect a TikTok Business account and we&apos;ll push videos through
            the official Publishing API with safe scheduling.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            TikTok Access Token
            <input
              type="password"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Bearer token from TikTok for Business"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            TikTok User ID
            <input
              type="text"
              value={tiktokUserId}
              onChange={(event) => setTiktokUserId(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g. 1234567890123456789"
              required
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Caption
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Hook + CTA + keywords"
            />
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <input
                type="checkbox"
                checked={autoHashtags}
                onChange={(event) => setAutoHashtags(event.target.checked)}
              />
              Auto-append niche hashtags
            </label>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Auto Publish At
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
            <span className="text-xs font-normal text-zinc-500">
              Set your peak engagement window in your local timezone.
            </span>
          </label>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs text-zinc-600 md:col-span-2">
            <p className="font-semibold text-zinc-700">Upload Checklist</p>
            <ul className="mt-2 space-y-1">
              <li>• Ensure your TikTok app has granted publishing permission.</li>
              <li>• Access token must include `video.upload` and `video.publish` scopes.</li>
              <li>• Schedule at least 10 minutes in the future to avoid API rejection.</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={!video || !accessToken || !tiktokUserId || state.status === "uploading"}
            className="md:col-span-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {state.status === "uploading"
              ? "Publishing to TikTok..."
              : "Schedule TikTok Upload"}
          </button>
        </form>

        {state.status === "success" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Video queued successfully. TikTok reference:{" "}
            <span className="font-semibold">{state.reference}</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Publish failed: <span className="font-semibold">{state.message}</span>
          </div>
        )}

        {!video && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Generate a video before scheduling. We need the rendered file to push
            through TikTok.
          </div>
        )}
      </div>
    </div>
  );
}
