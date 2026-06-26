import { supabase, type InterviewSession, type EvaluationRecord } from "@/lib/supabase";

export async function createSession(roundType: "technical" | "hr"): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      round_type: roundType,
      status: "idle",
      questions: [],
      evaluations: [],
    })
    .select()
    .single();

  if (error) {
    console.error("[Session] create error:", error);
    return null;
  }
  return data as InterviewSession;
}

export async function updateSessionQuestions(
  sessionId: string,
  questions: string[],
): Promise<boolean> {
  const { error } = await supabase
    .from("interview_sessions")
    .update({ questions, status: "live" })
    .eq("id", sessionId);

  if (error) {
    console.error("[Session] update questions error:", error);
    return false;
  }
  return true;
}

export async function addEvaluation(
  sessionId: string,
  evaluation: EvaluationRecord,
): Promise<boolean> {
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("evaluations")
    .eq("id", sessionId)
    .single();

  if (!session) return false;

  const evaluations = (session.evaluations as EvaluationRecord[]) || [];
  evaluations.push(evaluation);

  const avgConfidence =
    evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.confidence, 0) / evaluations.length)
      : 0;

  const { error } = await supabase
    .from("interview_sessions")
    .update({
      evaluations,
      average_confidence: avgConfidence,
      status: evaluations.length >= 5 ? "completed" : "live",
    })
    .eq("id", sessionId);

  if (error) {
    console.error("[Session] add evaluation error:", error);
    return false;
  }
  return true;
}

export async function getSession(sessionId: string): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("[Session] get error:", error);
    return null;
  }
  return data as InterviewSession;
}

export async function getRecentSessions(limit = 10): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Session] list error:", error);
    return [];
  }
  return (data || []) as InterviewSession[];
}
