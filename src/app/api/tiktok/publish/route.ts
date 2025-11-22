import { NextResponse } from "next/server";
const TIKTOK_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/init/";
const TIKTOK_SUBMIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/submit/";

function captionToTitle(caption: string) {
  return caption.slice(0, 42) || "Automated TikTok Drop";
}

function parseSchedule(scheduleTime: string | null) {
  if (!scheduleTime) return undefined;
  const date = new Date(scheduleTime);
  if (Number.isNaN(date.getTime())) return undefined;
  const now = Date.now();
  const minLead = now + 10 * 60 * 1000;
  const scheduled = Math.max(date.getTime(), minLead);
  return Math.floor(scheduled / 1000);
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const accessToken = formData.get("accessToken");
  const caption = formData.get("caption");
  const scheduleTime = formData.get("scheduleTime");
  const tiktokUserId = formData.get("tiktokUserId");
  const incomingFile = formData.get("video");
  const explicitFileName = formData.get("fileName") as string | null;

  if (
    typeof accessToken !== "string" ||
    typeof caption !== "string" ||
    typeof tiktokUserId !== "string" ||
    !(incomingFile instanceof File)
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const captionClean = caption.slice(0, 2200);
  const scheduleEpoch =
    typeof scheduleTime === "string" ? parseSchedule(scheduleTime) : undefined;

  const arrayBuffer = await incomingFile.arrayBuffer();
  const videoBuffer = Buffer.from(arrayBuffer);
  const contentType = incomingFile.type || "video/webm";
  const uploadFileName =
    explicitFileName ??
    `agentic-${Date.now()}.${
      contentType.includes("mp4") ? "mp4" : contentType.includes("webm") ? "webm" : "mp4"
    }`;

  try {
    const initResponse = await fetch(TIKTOK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        open_id: tiktokUserId,
        publish_id: uploadFileName,
        post_info: {
          title: captionToTitle(captionClean),
          description: captionClean,
          schedule_time: scheduleEpoch,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "FILE_UPLOAD",
        },
      }),
    });

    const initJson = await initResponse.json();
    if (!initResponse.ok) {
      return NextResponse.json(
        { error: initJson?.message ?? "TikTok init failed", details: initJson },
        { status: initResponse.status }
      );
    }

    const uploadUrl: string | undefined = initJson?.data?.upload_url;
    const publishId: string | undefined = initJson?.data?.publish_id;

    if (!uploadUrl || !publishId) {
      return NextResponse.json(
        { error: "TikTok response missing upload info", details: initJson },
        { status: 502 }
      );
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${uploadFileName}"`,
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      const uploadBody = await uploadResponse.text();
      return NextResponse.json(
        { error: "TikTok upload failed", details: uploadBody },
        { status: uploadResponse.status }
      );
    }

    const submitResponse = await fetch(TIKTOK_SUBMIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        open_id: tiktokUserId,
        publish_id: publishId,
      }),
    });

    const submitJson = await submitResponse.json();
    if (!submitResponse.ok) {
      return NextResponse.json(
        { error: submitJson?.message ?? "TikTok submit failed", details: submitJson },
        { status: submitResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      publishId: submitJson?.data?.publish_id ?? publishId,
      status: submitJson?.data?.status ?? "submitted",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
