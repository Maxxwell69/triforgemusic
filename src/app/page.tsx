"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type GenerateResult = {
  id: string;
  audio_url?: string;
  seed?: number;
  error?: string;
};

const STRUCTURE_TAGS = [
  "[intro]",
  "[verse]",
  "[pre-chorus]",
  "[chorus]",
  "[bridge]",
  "[inst]",
  "[build-up]",
  "[drop]",
  "[breakdown]",
  "[outro]",
];

// Rough proxy for the model's syllable-per-line limit: lines much longer than
// ~8 words tend to get crammed and come out rushed/garbled.
const LONG_LINE_WORD_THRESHOLD = 8;

function findLongLines(lyrics: string): number[] {
  return lyrics
    .split("\n")
    .map((line, i) => ({ i, words: line.trim().split(/\s+/).filter(Boolean).length }))
    .filter(({ words }) => words > LONG_LINE_WORD_THRESHOLD)
    .map(({ i }) => i + 1);
}

export default function GeneratePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [instrumental, setInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [duration, setDuration] = useState(60);
  const [ownerLabel, setOwnerLabel] = useState("");
  const [lyricGuidanceScale, setLyricGuidanceScale] = useState(0.75);
  const [numberOfSteps, setNumberOfSteps] = useState(27);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const longLines = useMemo(() => findLongLines(lyrics), [lyrics]);

  function insertTag(tag: string) {
    setLyrics((prev) => (prev.length && !prev.endsWith("\n") ? `${prev}\n${tag}\n` : `${prev}${tag}\n`));
  }

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
          lyricGuidanceScale,
          numberOfSteps,
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
            Comma-separated genre/mood tags. Avoid mixing contradictory genres
            (e.g. &quot;lofi&quot; + &quot;metal&quot;) — the model tends to blur them into a
            muddy result rather than fuse them cleanly.
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

            <div className="flex flex-wrap gap-1">
              {STRUCTURE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              placeholder={"[verse]\n...\n[chorus]\n..."}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm font-mono outline-none"
            />
            <p className="text-xs text-neutral-500">
              Only the tags above are recognized by the model — custom labels
              like &quot;[Final Chorus]&quot; are ignored and can confuse structure.
              Keep each line short (roughly 4-8 words) — long lines get crammed
              into the beat and come out rushed or garbled.
            </p>
            {longLines.length > 0 && (
              <p className="text-xs text-amber-500">
                Line{longLines.length > 1 ? "s" : ""} {longLines.join(", ")}{" "}
                {longLines.length > 1 ? "look" : "looks"} long — consider
                splitting for cleaner vocals.
              </p>
            )}
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
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="self-start text-xs text-neutral-500 underline"
        >
          {showAdvanced ? "Hide" : "Show"} advanced quality settings
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-3 rounded-md border border-neutral-300 dark:border-neutral-700 p-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Lyric guidance scale: {lyricGuidanceScale.toFixed(2)}
              </label>
              <input
                type="range"
                min={0.3}
                max={1.5}
                step={0.05}
                value={lyricGuidanceScale}
                onChange={(e) => setLyricGuidanceScale(Number(e.target.value))}
              />
              <p className="text-xs text-neutral-500">
                How closely vocals stick to the written lyrics. Lower (~0.5-0.75)
                sounds cleaner; above ~1.0 vocals tend to distort.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Generation steps: {numberOfSteps}
              </label>
              <input
                type="range"
                min={15}
                max={60}
                step={1}
                value={numberOfSteps}
                onChange={(e) => setNumberOfSteps(Number(e.target.value))}
              />
              <p className="text-xs text-neutral-500">
                More steps = more coherent detail, at the cost of generation
                time. ~27 is a good default; gains fade out past ~60.
              </p>
            </div>
          </div>
        )}

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
