import OpenAI from "openai";
import { toFile } from "openai/uploads";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribes a lecture recording with Whisper. `filename` should keep the
 * original extension (e.g. "lecture.webm") so the API can infer the format.
 */
export async function transcribeAudio(
  audio: Blob,
  filename: string
): Promise<string> {
  const file = await toFile(audio, filename);
  const result = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "text",
  });
  return typeof result === "string" ? result : String(result);
}
