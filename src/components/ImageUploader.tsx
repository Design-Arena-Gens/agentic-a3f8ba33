import NextImage from "next/image";
import { DragEvent, useRef, useState } from "react";

export type UploadedImage = {
  dataUrl: string;
  fileName: string;
  width: number;
  height: number;
};

type Props = {
  onChange: (image: UploadedImage | null) => void;
};

export function ImageUploader({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<UploadedImage | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.[0]) {
      setPreview(null);
      onChange(null);
      return;
    }

    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;

      const htmlImage = new window.Image();
      htmlImage.onload = () => {
        const uploaded: UploadedImage = {
          dataUrl: result,
          fileName: file.name,
          width: htmlImage.width,
          height: htmlImage.height,
        };
        setPreview(uploaded);
        onChange(uploaded);
      };
      htmlImage.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Step 1 · Source Image
            </h2>
            <p className="text-sm text-zinc-500">
              Upload a crisp portrait. We will animate and repurpose it into a
              9:16 video.
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        {preview ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div className="relative aspect-[9/16] w-full">
              <NextImage
                src={preview.dataUrl}
                alt="Uploaded preview"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 320px, 100vw"
                priority
              />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 bg-white p-3 text-xs text-zinc-500">
              <span>{preview.fileName}</span>
              <span>
                {preview.width}×{preview.height}
              </span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex aspect-[9/16] w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500"
          >
            Drop a portrait image here
          </div>
        )}
      </div>
    </div>
  );
}
