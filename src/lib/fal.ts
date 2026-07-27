import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export type AceStepInput = {
  tags: string;
  lyrics?: string;
  duration?: number;
};

export type AceStepOutput = {
  audio: { url: string; content_type: string };
  seed: number;
  tags: string;
  lyrics: string;
};

export async function generateMusic(input: AceStepInput): Promise<AceStepOutput> {
  const result = await fal.subscribe("fal-ai/ace-step", {
    input: {
      tags: input.tags,
      lyrics: input.lyrics ?? "[instrumental]",
      duration: input.duration ?? 60,
    },
    logs: false,
  });
  return result.data as AceStepOutput;
}
