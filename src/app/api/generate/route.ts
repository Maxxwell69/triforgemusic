import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { generateMusic } from "@/lib/fal";
import { insertTrack, updateTrack } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    tags,
    lyrics,
    duration,
    ownerLabel,
    lyricGuidanceScale,
    numberOfSteps,
  } = body as {
    title?: string;
    tags?: string;
    lyrics?: string;
    duration?: number;
    ownerLabel?: string;
    lyricGuidanceScale?: number;
    numberOfSteps?: number;
  };

  if (!tags || !tags.trim()) {
    return NextResponse.json({ error: "tags is required" }, { status: 400 });
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  await insertTrack({
    id,
    created_at: createdAt,
    owner_role: "staff",
    owner_label: ownerLabel?.trim() || "staff",
    title: title?.trim() || tags.trim(),
    tags: tags.trim(),
    lyrics: lyrics?.trim() ?? "",
    duration: duration ?? 60,
    seed: null,
    audio_url: null,
    status: "pending",
    error: null,
  });

  try {
    const result = await generateMusic({
      tags: tags.trim(),
      lyrics: lyrics?.trim(),
      duration,
      lyricGuidanceScale,
      numberOfSteps,
    });

    await updateTrack(id, {
      audio_url: result.audio.url,
      seed: result.seed,
      status: "complete",
    });

    return NextResponse.json({ id, audio_url: result.audio.url, seed: result.seed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    await updateTrack(id, { status: "failed", error: message });
    return NextResponse.json({ id, error: message }, { status: 502 });
  }
}
