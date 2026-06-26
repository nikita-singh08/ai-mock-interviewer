import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type InterviewSession = {
  id: string;
  candidate_name: string;
  round_type: "technical" | "hr";
  questions: string[];
  evaluations: EvaluationRecord[];
  average_confidence: number;
  status: "idle" | "live" | "completed";
  created_at: string;
  updated_at: string;
};

export type EvaluationRecord = {
  transcription: string;
  confidence: number;
  strengths: string[];
  improvements: string[];
};
