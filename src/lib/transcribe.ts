import OpenAI from "openai";
import { toFile } from "openai/uploads";

let openai: OpenAI | undefined;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Transcribes a lecture recording with Whisper. `filename` should keep the
 * original extension (e.g. "lecture.webm") so the API can infer the format.
 */
export async function transcribeAudio(
  audio: Blob,
  filename: string
): Promise<string> {
  const file = await toFile(audio, filename);
  const result = await getOpenAI().audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "text",
  });
  return typeof result === "string" ? result : String(result);
}
