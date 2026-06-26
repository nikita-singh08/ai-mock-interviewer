import { useCallback, useEffect, useRef, useState } from "react";

import { uploadResume, fetchAudioBlob, processAnswer, generateReport, downloadBlob } from "@/services/api";
import { createSession, updateSessionQuestions, addEvaluation } from "@/services/session";
import {
  MAX_RECORD_SECONDS,
  MOCK_QUESTIONS,
  mockEvaluation,
  type Evaluation,
  type Round,
} from "../types";

export type InterviewStatus = "idle" | "loading" | "live" | "evaluating" | "recording" | "completed";

export type SessionState = {
  totalQuestions: number;
  currentQuestion: number;
  completedQuestions: number;
  roundType: Round;
  status: InterviewStatus;
};

export function useInterview() {
  // Setup
  const [resume, setResume] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [round, setRound] = useState<Round>("technical");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interview
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Audio playback
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Recording
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feedback
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = questions.length;
  const currentQuestion =
    questions[questionIndex] ?? "Upload a resume and start the interview to begin.";

  const isLastQuestion = total > 0 && questionIndex >= total - 1;

  const resetAnswerState = useCallback(() => {
    setTranscript("");
    setConfidence(0);
    setStrengths([]);
    setImprovements([]);
    setEvaluated(false);
    setPlaying(false);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const applyEvaluation = useCallback((ev: Evaluation) => {
    setTranscript(ev.transcription);
    setStrengths(ev.strengths);
    setImprovements(ev.improvements);
    setEvaluated(true);

    const target = Math.max(0, Math.min(100, Math.round(ev.confidence)));
    setConfidence(0);
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setConfidence(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const startInterview = useCallback(async () => {
    if (!resume || uploading) return;
    setUploading(true);
    setError(null);
    resetAnswerState();
    setEvaluations([]);
    setShowReport(false);

    // Create Supabase session
    const session = await createSession(round);
    if (session) {
      setSessionId(session.id);
    }

    try {
      const list = await uploadResume(resume, round);
      setQuestions(list);
      setQuestionIndex(0);
      setStarted(true);
      if (session) {
        await updateSessionQuestions(session.id, list);
      }
    } catch (err) {
      console.warn("[API] upload-resume failed, using mock questions:", err);
      setError("Backend unavailable. Using demo questions. Start the backend for AI-generated questions.");
      setQuestions(MOCK_QUESTIONS[round]);
      setQuestionIndex(0);
      setStarted(true);
      if (session) {
        await updateSessionQuestions(session.id, MOCK_QUESTIONS[round]);
      }
    } finally {
      setUploading(false);
    }
  }, [resume, round, uploading, resetAnswerState]);

  const playAudio = useCallback(async () => {
    if (audioLoading) return;
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const blob = await fetchAudioBlob(currentQuestion);
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlaying(false);
        setAudioLoading(false);
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
      };
      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.warn("[API] get-audio failed, simulating playback:", err);
      setError("Audio playback unavailable. Backend may be offline.");
      setPlaying(true);
      setTimeout(() => setPlaying(false), 2500);
    } finally {
      setAudioLoading(false);
    }
  }, [audioLoading, currentQuestion, playing]);

  const stopRecording = useCallback(() => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    autoStopRef.current = null;
    recordTimerRef.current = null;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);
  
  const goNext = useCallback(() => {
    if (questionIndex >= total - 1) {
      if (evaluated && evaluations.length >= total) {
        setShowReport(true);
      }
      return;
    }
    setQuestionIndex((i) => i + 1);
    resetAnswerState();
  }, [questionIndex, resetAnswerState, total, evaluated, evaluations.length]);


  const sendAnswer = useCallback(
    async (blob: Blob) => {
      setProcessing(true);
      try {
        const data = await processAnswer(blob, currentQuestion, questionIndex);
        applyEvaluation(data);
        setEvaluations((prev) => [...prev, data]);
        if (sessionId) {
          await addEvaluation(sessionId, {
            transcription: data.transcription,
            confidence: data.confidence,
            strengths: data.strengths,
            improvements: data.improvements,
          });
        }
      } catch (err) {
        console.warn("[API] process-answer failed, using mock evaluation:", err);
        setError("Answer evaluation failed. Using fallback scoring.");
        const mock = mockEvaluation();
        applyEvaluation(mock);
        setEvaluations((prev) => [...prev, mock]);
        if (sessionId) {
          await addEvaluation(sessionId, {
            transcription: mock.transcription,
            confidence: mock.confidence,
            strengths: mock.strengths,
            improvements: mock.improvements,
          });
        }
      } finally {
        setProcessing(false);
        goNext();
      }
    },
    [
  applyEvaluation,
  currentQuestion,
  questionIndex,
  sessionId,
  goNext,
],
  );

  const toggleRecording = useCallback(async () => {
    if (processing) return;
    if (recording) {
      stopRecording();
      return;
    }
    if (!started) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
     rec.onstop = () => {
    console.log("onstop fired");

    stream.getTracks().forEach((t) => t.stop());
    setRecording(false);

    const blob = new Blob(chunksRef.current, {
        type: rec.mimeType || "audio/webm",
    });

    console.log("Blob size:", blob.size);

    if (blob.size > 0) {
        console.log("Calling sendAnswer...");
        void sendAnswer(blob);
    } else {
        console.log("Blob is empty");
    }
};
      rec.start();
      setRecording(true);
      setRecordSeconds(0);
      resetAnswerState();

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
      autoStopRef.current = setTimeout(() => stopRecording(), MAX_RECORD_SECONDS * 1000);
    } catch (err) {
      console.warn("[Media] getUserMedia failed, simulating recording:", err);
      setError("Microphone access denied. Using simulated recording.");
      setRecording(true);
      setRecordSeconds(0);
      resetAnswerState();
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
      autoStopRef.current = setTimeout(() => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
        autoStopRef.current = null;
        setRecording(false);
        void sendAnswer(new Blob([new Uint8Array([0])], { type: "audio/webm" }));
      }, MAX_RECORD_SECONDS * 1000);
    }
  }, [processing, recording, resetAnswerState, sendAnswer, started, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const goPrev = useCallback(() => {
    if (questionIndex <= 0) return;
    setQuestionIndex((i) => i - 1);
    resetAnswerState();
  }, [questionIndex, resetAnswerState]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      setResume(f);
      setError(null);
    } else {
      setError("Only PDF files are supported.");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const downloadReport = useCallback(async () => {
    if (evaluations.length === 0) return;
    setReportGenerating(true);
    try {
      const blob = await generateReport("Candidate", round);
      downloadBlob(blob, `mockwise_report_${round}.pdf`);
    } catch (err) {
      console.warn("[API] generate-report failed:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setReportGenerating(false);
    }
  }, [evaluations.length, round]);

  const dismissError = useCallback(() => setError(null), []);

  return {
    // refs
    fileInputRef,
    // setup
    resume,
    setResume,
    dragOver,
    setDragOver,
    round,
    setRound,
    uploading,
    error,
    dismissError,
    // interview
    started,
    questions,
    questionIndex,
    total,
    currentQuestion,
    isLastQuestion,
    // audio
    playing,
    audioLoading,
    playAudio,
    // recording
    recording,
    processing,
    recordSeconds,
    toggleRecording,
    // feedback
    transcript,
    confidence,
    strengths,
    improvements,
    evaluated,
    // nav
    goNext,
    goPrev,
    // file
    onDrop,
    handleFiles,
    startInterview,
    // report
    showReport,
    setShowReport,
    reportGenerating,
    downloadReport,
    evaluations,
  };
}
