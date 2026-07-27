import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export type AceStepInput = {
  tags: string;
  lyrics?: string;
  duration?: number;
  lyricGuidanceScale?: number;
  numberOfSteps?: number;
};

export type AceStepOutput = {
  audio: { url: string; content_type: string };
  seed: number;
  tags: string;
  lyrics: string;
};

// fal.ai's default lyric_guidance_scale (1.5) runs hotter than ACE-Step's own
// sweet spot for clean vocals — community testing puts 0.5-0.75 as the range
// before distortion creeps in, so we default lower than the API's own default.
const DEFAULT_LYRIC_GUIDANCE_SCALE = 0.75;
const DEFAULT_NUMBER_OF_STEPS = 27;

export async function generateMusic(input: AceStepInput): Promise<AceStepOutput> {
  const result = await fal.subscribe("fal-ai/ace-step", {
    input: {
      tags: input.tags,
      lyrics: input.lyrics ?? "[instrumental]",
      duration: input.duration ?? 60,
      lyric_guidance_scale: input.lyricGuidanceScale ?? DEFAULT_LYRIC_GUIDANCE_SCALE,
      number_of_steps: input.numberOfSteps ?? DEFAULT_NUMBER_OF_STEPS,
    },
    logs: false,
  });
  return result.data as AceStepOutput;
}
