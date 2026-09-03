import Anthropic from "@anthropic-ai/sdk";
import type { Flashcard } from "@/types/database";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface LectureNotes {
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
}

const NOTES_TOOL = {
  name: "record_lecture_notes",
  description: "Records structured study notes generated from a lecture transcript.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description:
          "A dense 3-6 sentence summary of the lecture's content and argument.",
      },
      keyPoints: {
        type: "array",
        items: { type: "string" },
        description: "5-10 concise bullet points covering the most important ideas.",
      },
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
        },
        description: "6-12 study flashcards (question/answer pairs) drawn from the material.",
      },
    },
    required: ["summary", "keyPoints", "flashcards"],
  },
};

/**
 * Turns a raw transcript into a summary, key points, and flashcards using
 * Claude's tool-use to force structured output.
 */
export async function generateLectureNotes(
  transcript: string
): Promise<LectureNotes> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    tools: [NOTES_TOOL],
    tool_choice: { type: "tool", name: NOTES_TOOL.name },
    messages: [
      {
        role: "user",
        content: `Here is a lecture transcript. Generate study notes from it.\n\n<transcript>\n${transcript}\n</transcript>`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured notes");
  }

  return toolUse.input as LectureNotes;
}
