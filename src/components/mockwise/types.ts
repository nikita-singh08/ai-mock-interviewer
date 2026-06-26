export type Round = "technical" | "hr";

export const API_BASE = "http://localhost:8000";
export const MAX_RECORD_SECONDS = 10;

// Mock fallbacks used when the local FastAPI backend isn't reachable.
export const MOCK_QUESTIONS: Record<Round, string[]> = {
  technical: [
    "Walk me through how you'd design a URL shortener that handles 10K requests per second.",
    "Explain the difference between optimistic and pessimistic concurrency control with an example.",
    "How would you debug a memory leak in a long-running Node.js service?",
    "Describe a time you refactored a complex module. What trade-offs did you weigh?",
    "Given an unsorted array, design an algorithm to find the k-th largest element efficiently.",
  ],
  hr: [
    "Tell me about yourself and what drew you to this role.",
    "Describe a conflict you had with a teammate and how you resolved it.",
    "What does your ideal work environment look like?",
    "Where do you see yourself in three years?",
    "Tell me about a time you failed. What did you learn?",
  ],
};

export type Evaluation = {
  transcription: string;
  confidence: number;
  strengths: string[];
  improvements: string[];
};

export function mockEvaluation(): Evaluation {
  const confidence = 60 + Math.floor(Math.random() * 35);
  return {
    transcription:
      "So, the first thing I'd consider is the read-to-write ratio, then sketch the data model and identify the hot paths before scaling horizontally.",
    confidence,
    strengths: [
      "Clear problem framing upfront",
      "Good use of concrete examples",
      "Steady pacing, minimal filler",
    ],
    improvements: [
      "Quantify impact with metrics",
      "Tighten the closing summary",
      "Address trade-offs explicitly",
    ],
  };
}
