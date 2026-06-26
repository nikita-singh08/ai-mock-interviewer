import { API_BASE, type Evaluation, type Round } from "./types";

export async function uploadResume(file: File, round: Round): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("round", round);

  console.log("[API] POST /api/upload-resume payload:", {
    filename: file.name,
    size: file.size,
    round,
  });

  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as { questions?: string[] } | string[];
  const list = Array.isArray(data) ? data : (data.questions ?? []);
  if (!list.length) throw new Error("Empty question list");

  console.log("[API] /api/upload-resume response:", list);
  return list;
}

export async function fetchAudioBlob(text: string): Promise<Blob> {
  const url = `${API_BASE}/api/get-audio?text=${encodeURIComponent(text)}`;
  console.log("[API] GET", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

export async function processAnswer(
  
  blob: Blob,
  currentQuestion: string,
  questionIndex: number,
): Promise<Evaluation> {
  console.log("processAnswer() called");
  const formData = new FormData();
  formData.append("audio", blob, "answer.webm");
  formData.append("question", currentQuestion);
  formData.append("questionIndex", String(questionIndex));

  console.log("[API] POST /api/process-answer payload:", {
    blobSize: blob.size,
    blobType: blob.type,
    question: currentQuestion,
    questionIndex,
  });
  console.log("Sending request to:", `${API_BASE}/api/process-answer`);
  const res = await fetch(`${API_BASE}/api/process-answer`, {

    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as Partial<Evaluation>;
  console.log("[API] /api/process-answer response:", data);

  return {
    transcription: data.transcription ?? "",
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    strengths: data.strengths ?? [],
    improvements: data.improvements ?? [],
  };
}
