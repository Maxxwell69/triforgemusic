"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Track = {
  id: string;
  created_at: string;
  owner_label: string;
  title: string;
  tags: string;
  status: string;
  audio_url: string | null;
  error: string | null;
};

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tracks")
      .then((r) => r.json())
      .then((data) => setTracks(data.tracks ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Library</h1>
        <Link href="/" className="text-sm text-neutral-500 underline">
          New track
        </Link>
      </header>

      {loading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!loading && tracks.length === 0 && (
        <p className="text-sm text-neutral-500">No tracks generated yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {tracks.map((t) => (
          <div
            key={t.id}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{t.title}</p>
              <span className="text-xs text-neutral-500">{t.status}</span>
            </div>
            <p className="text-xs text-neutral-500">
              {t.owner_label} · {t.tags} ·{" "}
              {new Date(t.created_at).toLocaleString()}
            </p>
            {t.status === "complete" && t.audio_url && (
              <audio controls src={t.audio_url} className="mt-2 w-full" />
            )}
            {t.status === "failed" && (
              <p className="mt-2 text-sm text-red-500">{t.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
