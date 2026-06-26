import { API_BASE, type Evaluation, type Round } from "@/components/mockwise/types";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let details = "";
    try {
      const err = await res.json();
      details = err.detail || err.error || JSON.stringify(err);
    } catch {
      details = await res.text();
    }
    throw new APIError(`HTTP ${res.status}: ${res.statusText}`, res.status, details);
  }
  return res.json() as Promise<T>;
}

export async function uploadResume(file: File, round: Round): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("round", round);

  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: "POST",
    body: formData,
  });

  const data = await handleResponse<{ questions?: string[] }>(res);
  const list = data.questions ?? [];
  if (!list.length) throw new APIError("Empty question list from server");
  return list;
}

export async function fetchAudioBlob(text: string): Promise<Blob> {
  const url = `${API_BASE}/api/get-audio?text=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new APIError(`HTTP ${res.status}: Failed to fetch audio`);
  }
  return res.blob();
}

export async function processAnswer(
  blob: Blob,
  currentQuestion: string,
  questionIndex: number,
): Promise<Evaluation> {
  const formData = new FormData();
  formData.append("audio", blob, "answer.webm");
  formData.append("question", currentQuestion);
  formData.append("questionIndex", String(questionIndex));

  const res = await fetch(`${API_BASE}/api/process-answer`, {
    method: "POST",
    body: formData,
  });

  const data = await handleResponse<Partial<Evaluation>>(res);

  return {
    transcription: data.transcription ?? "",
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    strengths: data.strengths ?? [],
    improvements: data.improvements ?? [],
  };
}

export async function generateReport(
  candidateName: string,
  roundType: Round,
): Promise<Blob> {
  const formData = new FormData();
  formData.append("candidate_name", candidateName);
  formData.append("round_type", roundType);

  const res = await fetch(`${API_BASE}/api/generate-report`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new APIError(`HTTP ${res.status}: Failed to generate report`);
  }
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
