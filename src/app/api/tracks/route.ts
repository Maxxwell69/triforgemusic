import { NextResponse } from "next/server";
import { listTracks } from "@/lib/db";

export async function GET() {
  const tracks = await listTracks();
  return NextResponse.json({ tracks });
}
