"use client";

import { useState } from "react";
import Link from "next/link";

type GenerateResult = {
  id: string;
  audio_url?: string;
  seed?: number;
  error?: string;
};

export default function GeneratePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [instrumental, setInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [duration, setDuration] = useState(60);
  const [ownerLabel, setOwnerLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tags,
          lyrics: instrumental ? "[instrumental]" : lyrics,
          duration,
          ownerLabel,
        }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Tri Forge Music Studio</h1>
          <p className="text-sm text-neutral-500">
            Internal AI music generation — staff only
          </p>
        </div>
        <Link href="/library" className="text-sm text-neutral-500 underline">
          Library
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Client X — intro theme"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Genre / style tags *</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="lofi, hiphop, chill, warm piano"
            required
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <p className="text-xs text-neutral-500">
            Comma-separated genre/mood tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="instrumental"
            type="checkbox"
            checked={instrumental}
            onChange={(e) => setInstrumental(e.target.checked)}
          />
          <label htmlFor="instrumental" className="text-sm">
            Instrumental (no vocals)
          </label>
        </div>

        {!instrumental && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Lyrics</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={6}
              placeholder={"[verse]\n...\n[chorus]\n..."}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Duration: {duration}s
          </label>
          <input
            type="range"
            min={15}
            max={240}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Your name / client tag</label>
          <input
            value={ownerLabel}
            onChange={(e) => setOwnerLabel(e.target.value)}
            placeholder="e.g. maxx, or client name"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tags.trim()}
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-100 dark:text-neutral-900 disabled:opacity-50"
        >
          {loading ? "Generating (can take ~30-60s)..." : "Generate track"}
        </button>
      </form>

      {result && (
        <div className="rounded-md border border-neutral-300 dark:border-neutral-700 p-4">
          {result.error ? (
            <p className="text-sm text-red-500">Error: {result.error}</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-neutral-500">Done. Seed: {result.seed}</p>
              <audio controls src={result.audio_url} className="w-full" />
              <a
                href={result.audio_url}
                download
                className="mt-2 inline-block text-sm underline"
              >
                Download
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
