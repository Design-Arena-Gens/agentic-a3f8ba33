import { useEffect, useRef, useState } from "react";
import type { UploadedImage } from "./ImageUploader";
import type { GeneratedScript } from "@/lib/scriptEngine";

export type GeneratedVideo = {
  blob: Blob;
  url: string;
  fileName: string;
  hashtags: string[];
  caption: string;
};

type Props = {
  image: UploadedImage | null;
  script: (GeneratedScript & { hashtags: string[] }) | null;
  onVideoReady: (video: GeneratedVideo | null) => void;
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const VIDEO_DURATION_MS = 9000;

export function VideoComposer({ image, script, onVideoReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      imageRef.current = null;
      return;
    }

    const img = new Image();
    img.src = image.dataUrl;
    imageRef.current = img;
  }, [image]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const drawBackground = (ctx: CanvasRenderingContext2D, progress: number) => {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const img = imageRef.current;
    if (!img) return;

    const baseScale = Math.max(
      CANVAS_WIDTH / img.width,
      CANVAS_HEIGHT / img.height
    );
    const zoom = baseScale * (1 + progress * 0.12);
    const drawWidth = img.width * zoom;
    const drawHeight = img.height * zoom;
    const offsetX = (CANVAS_WIDTH - drawWidth) / 2;
    const offsetY = (CANVAS_HEIGHT - drawHeight) / 2;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    const gradient = ctx.createLinearGradient(
      0,
      CANVAS_HEIGHT * 0.55,
      0,
      CANVAS_HEIGHT
    );
    gradient.addColorStop(0, "rgba(15,23,42,0)");
    gradient.addColorStop(1, "rgba(15,23,42,0.9)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, CANVAS_HEIGHT * 0.4, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
  };

  const drawTextBlock = (
    ctx: CanvasRenderingContext2D,
    text: string,
    options: {
      top: number;
      fontSize: number;
      fontWeight?: string;
      color?: string;
      lineHeight?: number;
      maxWidth?: number;
      textAlign?: CanvasTextAlign;
      uppercase?: boolean;
    }
  ) => {
    const {
      top,
      fontSize,
      fontWeight = "600",
      color = "#f8fafc",
      lineHeight = 1.35,
      maxWidth = CANVAS_WIDTH * 0.84,
      textAlign = "center",
      uppercase = false,
    } = options;

    const processed = uppercase ? text.toUpperCase() : text;
    const words = processed.split(" ");
    const lines: string[] = [];

    let currentLine = "";
    for (const word of words) {
      const testLine = `${currentLine ? `${currentLine} ` : ""}${word}`;
      const measurement = ctx.measureText(testLine);
      if (measurement.width > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    ctx.font = `${fontWeight} ${fontSize}px Sora, Inter, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";

    lines.forEach((line, index) => {
      ctx.fillText(line, CANVAS_WIDTH / 2, top + index * fontSize * lineHeight);
    });
  };

  const generateVideo = async () => {
    if (!canvasRef.current || !imageRef.current || !script) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsRendering(true);
    onVideoReady(null);

    const stream = canvas.captureStream(30);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    recorder.ondataavailable = (event) => {
      if (!event.data.size) return;
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const fileName = `${script?.niche.replace(/\s+/g, "-")}-${Date.now()}.webm`;
      const url = URL.createObjectURL(blob);
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      onVideoReady({
        blob,
        url,
        fileName,
        hashtags: script.hashtags,
        caption: `${script.hook} ${script.cta} ${script.hashtags.join(" ")}`,
      });
      setIsRendering(false);
    };

    const draw = (timestamp: number, startTime: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / VIDEO_DURATION_MS, 1);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBackground(ctx, progress);

      ctx.save();
      ctx.shadowColor = "rgba(15,23,42,0.85)";
      ctx.shadowBlur = 24;
      drawTextBlock(ctx, script.hook, {
        top: 180,
        fontSize: 72,
        lineHeight: 1.15,
        uppercase: true,
      });
      ctx.restore();

      drawTextBlock(ctx, script.body, {
        top: 720,
        fontSize: 44,
        fontWeight: "500",
        lineHeight: 1.4,
        color: "#e2e8f0",
      });

      drawTextBlock(ctx, script.cta, {
        top: 1380,
        fontSize: 56,
        fontWeight: "700",
        lineHeight: 1.2,
        color: "#facc15",
      });

      const footerTop = 1680;
      ctx.font = "500 32px Sora, Inter, sans-serif";
      ctx.fillStyle = "rgba(226,232,240,0.85)";
      ctx.textAlign = "center";
      ctx.fillText(script.hashtags.join("  "), CANVAS_WIDTH / 2, footerTop);

      if (progress < 1) {
        requestAnimationFrame((frameTime) => draw(frameTime, startTime));
      }
    };

    recorder.start();

    const start = performance.now();
    requestAnimationFrame((frameTime) => draw(frameTime, start));

    setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, VIDEO_DURATION_MS + 320);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-zinc-900">
            Step 3 · Dynamic Video Render
          </h2>
          <p className="text-sm text-zinc-500">
            We transform the still portrait into a kinetic 9:16 canvas with Ken
            Burns motion, layered typography, and TikTok-native pacing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[300px,1fr]">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="h-72 w-full rounded-lg border border-zinc-200 bg-black"
            />
            <button
              onClick={generateVideo}
              disabled={!image || !script || isRendering}
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isRendering ? "Rendering..." : "Generate Motion Video"}
            </button>
            <p className="text-center text-xs text-zinc-500">
              Video renders locally in-browser. Keep this tab open until it
              finalizes.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-4 text-sm text-zinc-600">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Script Snapshot
              </p>
              {script ? (
                <ul className="space-y-2">
                  <li>
                    <span className="font-semibold text-zinc-800">Hook:</span>{" "}
                    {script.hook}
                  </li>
                  <li>
                    <span className="font-semibold text-zinc-800">Body:</span>{" "}
                    {script.body}
                  </li>
                  <li>
                    <span className="font-semibold text-zinc-800">CTA:</span>{" "}
                    {script.cta}
                  </li>
                </ul>
              ) : (
                <p>Generate a script to visualize the narration beats.</p>
              )}
            </div>

            {previewUrl ? (
              <div className="rounded-xl border border-zinc-200 bg-black/90 p-3">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="aspect-[9/16] w-full rounded-lg border border-zinc-800"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Preview is a WebM export. TikTok will transcode automatically
                  upon upload.
                </p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white text-sm text-zinc-500">
                Render a video to preview and publish.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
