import { CircleAlert as AlertCircle, TriangleAlert as AlertTriangle, Briefcase, CircleCheck as CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Loader as Loader2, Mic, Pause, Play, Rocket, Sparkles, Upload, UserRound, X } from "lucide-react";

import { useInterview } from "./hooks/useInterview";
import { AudioWave, ConfidenceRing, FeedbackList, Panel, RoundChip, Stat } from "./ui";
import { MAX_RECORD_SECONDS } from "./types";

export function Dashboard() {
  const {
    fileInputRef,
    resume,
    setResume,
    dragOver,
    setDragOver,
    round,
    setRound,
    uploading,
    started,
    questionIndex,
    total,
    currentQuestion,
    playing,
    audioLoading,
    playAudio,
    recording,
    processing,
    recordSeconds,
    toggleRecording,
    transcript,
    confidence,
    strengths,
    improvements,
    evaluated,
    goNext,
    goPrev,
    onDrop,
    handleFiles,
    startInterview,
    error,
    dismissError,
    isLastQuestion,
    showReport,
    setShowReport,
    reportGenerating,
    downloadReport,
    evaluations,
  } = useInterview();

  const averageConfidence =
    evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.confidence, 0) / evaluations.length)
      : 0;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-20 bg-background/70">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-[var(--shadow-glow)]">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-none">Mockwise</div>
              <div className="text-xs text-muted-foreground mt-1">AI Mock Interview</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {started ? "Live session" : "Idle"}
            </div>
            <div className="size-9 rounded-full bg-secondary grid place-items-center text-sm font-medium">
              AK
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-5">
          <Panel title="Setup" subtitle="Upload your resume & pick a round">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "relative rounded-xl border-2 border-dashed p-5 cursor-pointer transition-all",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60 hover:bg-surface-elevated/40",
              ].join(" ")}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {resume ? (
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-primary/15 grid place-items-center shrink-0">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{resume.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(resume.size / 1024).toFixed(1)} KB · PDF
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResume(null);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove resume"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto size-11 rounded-xl bg-secondary grid place-items-center mb-3">
                    <Upload className="size-5 text-muted-foreground" />
                  </div>
                  <div className="text-sm font-medium">Drop your PDF resume</div>
                  <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Interview Round
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
                <RoundChip
                  active={round === "technical"}
                  onClick={() => setRound("technical")}
                  icon={<Briefcase className="size-4" />}
                  label="Technical"
                />
                <RoundChip
                  active={round === "hr"}
                  onClick={() => setRound("hr")}
                  icon={<UserRound className="size-4" />}
                  label="HR Round"
                />
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={!resume || uploading}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium px-4 py-3 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[var(--shadow-glow)]"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Preparing interview…
                </>
              ) : (
                <>
                  <Rocket className="size-4" />
                  {started ? "Restart Interview" : "Start Interview"}
                </>
              )}
            </button>
            {!resume && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Upload a resume to enable
              </p>
            )}
          </Panel>

          <Panel title="Session" subtitle="Quick stats">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Round" value={round === "technical" ? "Technical" : "HR"} />
              <Stat label="Questions" value={`${total || 0}`} />
              <Stat label="Progress" value={total ? `${questionIndex + 1}/${total}` : "—"} />
              <Stat
                label="Status"
                value={
                  uploading
                    ? "Loading"
                    : processing
                      ? "Evaluating"
                      : recording
                        ? "Recording"
                        : started
                          ? "Live"
                          : "Idle"
                }
              />
            </div>
          </Panel>
        </aside>

        {/* Main arena */}
        <section className="col-span-12 lg:col-span-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-warning-foreground font-medium">{error}</div>
              </div>
              <button
                onClick={dismissError}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="relative rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
            {uploading && (
              <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <div className="text-sm text-muted-foreground">
                    Analyzing resume & generating questions…
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {total ? `Question ${questionIndex + 1} of ${total}` : "Waiting to start"}
                </div>
                <div className="mt-1 text-xs text-primary">
                  {round === "technical" ? "Technical Round" : "HR Round"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: total || 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === questionIndex && total ? "w-8 bg-primary" : "w-2 bg-secondary",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <div className="px-6 py-7">
              <h2 className="text-xl sm:text-2xl font-display font-medium leading-snug text-balance">
                {currentQuestion}
              </h2>

              {/* Audio player */}
              <div className="mt-6 rounded-xl bg-surface-elevated/60 border border-border p-4 flex items-center gap-4">
                <button
                  onClick={playAudio}
                  disabled={!started || audioLoading}
                  className="size-11 rounded-full bg-primary text-primary-foreground grid place-items-center hover:brightness-110 active:scale-95 transition-all shrink-0 disabled:opacity-50"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {audioLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : playing ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5 translate-x-px" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-2">AI Interviewer · Voice</div>
                  <AudioWave playing={playing} />
                </div>
                <div className="text-xs tabular-nums text-muted-foreground shrink-0">
                  {audioLoading ? "loading…" : playing ? "playing" : "ready"}
                </div>
              </div>
            </div>

            {/* Record */}
            <div className="px-6 pb-6">
              <div className="rounded-xl border border-border bg-background/40 p-6 flex flex-col items-center">
                <div className="relative">
                  {recording && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-destructive/40 animate-pulse-ring" />
                      <span
                        className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </>
                  )}
                  <button
                    onClick={toggleRecording}
                    disabled={!started || processing}
                    className={[
                      "relative size-20 rounded-full grid place-items-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                      recording
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground hover:brightness-110",
                    ].join(" ")}
                    aria-label={recording ? "Stop recording" : "Start recording"}
                  >
                    {processing ? (
                      <Loader2 className="size-8 animate-spin" />
                    ) : (
                      <Mic className="size-8" />
                    )}
                  </button>
                </div>
                <div className="mt-4 text-sm font-medium">
                  {processing
                    ? "Evaluating your answer…"
                    : recording
                      ? `Listening… ${MAX_RECORD_SECONDS - recordSeconds}s left`
                      : "Click to speak / record answer"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Records up to {MAX_RECORD_SECONDS}s, sent to /api/process-answer
                </div>
              </div>

              {/* Transcript */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Live Transcription
                  </div>
                  {recording && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>
                <div className="min-h-[120px] rounded-xl border border-border bg-background/50 p-4 text-sm leading-relaxed">
                  {processing ? (
                    <span className="text-muted-foreground inline-flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" /> Transcribing…
                    </span>
                  ) : transcript ? (
                    <span>{transcript}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Your answer will appear here after you finish speaking…
                    </span>
                  )}
                </div>
              </div>

              {/* Nav */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  disabled={questionIndex === 0 || !total}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>
                <div className="text-xs text-muted-foreground">
                  {total ? `${questionIndex + 1} / ${total}` : "—"}
                </div>
                <button
                  onClick={goNext}
                  disabled={!evaluated || questionIndex >= total - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLastQuestion && evaluated ? "Finish Interview" : "Next Question"}{" "}
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Final Report Modal */}
          {showReport && (
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden animate-fade-in">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold text-lg">Interview Complete</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {round === "technical" ? "Technical Round" : "HR Round"} · {total} questions
                  </div>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close report"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="px-6 py-7 space-y-6">
                <div className="flex flex-col items-center">
                  <ConfidenceRing value={averageConfidence} />
                  <div className="mt-4 text-center">
                    <div className="text-sm font-medium">Average Confidence</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {averageConfidence >= 80
                        ? "Excellent performance"
                        : averageConfidence >= 65
                          ? "Solid with room to grow"
                          : "Keep practicing"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-primary" />
                      <div className="text-sm font-medium">Strongest Skills</div>
                    </div>
                    <ul className="space-y-2">
                      {evaluations.length > 0 ? (
                        Array.from(
                          new Set(evaluations.flatMap((e) => e.strengths)),
                        )
                          .slice(0, 5)
                          .map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary mt-1.5 size-1 rounded-full bg-current shrink-0" />
                              {s}
                            </li>
                          ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No data available</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="size-4 text-warning" />
                      <div className="text-sm font-medium">Major Improvements</div>
                    </div>
                    <ul className="space-y-2">
                      {evaluations.length > 0 ? (
                        Array.from(
                          new Set(evaluations.flatMap((e) => e.improvements)),
                        )
                          .slice(0, 5)
                          .map((imp, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-warning mt-1.5 size-1 rounded-full bg-current shrink-0" />
                              {imp}
                            </li>
                          ))
                      ) : (
                        <li className="text-sm text-muted-foreground">No data available</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={downloadReport}
                    disabled={reportGenerating}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium px-6 py-3 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 shadow-[var(--shadow-glow)]"
                  >
                    {reportGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Generating PDF…
                      </>
                    ) : (
                      <>
                        <Download className="size-4" />
                        Download Report PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Evaluation */}
        <aside className="col-span-12 lg:col-span-3 space-y-5">
          <Panel title="Confidence Score" subtitle="AI-evaluated, this answer">
            <div className="flex flex-col items-center pt-2">
              <ConfidenceRing value={confidence} />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {!evaluated
                  ? "Record an answer to see your score."
                  : confidence >= 80
                    ? "Excellent — clear and assured."
                    : confidence >= 65
                      ? "Solid delivery, room to sharpen."
                      : "Slow down and lead with structure."}
              </div>
            </div>
          </Panel>

          <Panel title="Live Feedback" subtitle="Updated per answer">
            {evaluated ? (
              <>
                <FeedbackList
                  icon={<CheckCircle2 className="size-4 text-primary" />}
                  title="Strengths"
                  items={strengths}
                />
                <div className="my-4 border-t border-border" />
                <FeedbackList
                  icon={<AlertCircle className="size-4 text-warning" />}
                  title="Areas to Improve"
                  items={improvements}
                />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Feedback will populate once your answer is evaluated.
              </div>
            )}
          </Panel>
        </aside>
      </main>
    </div>
  );
}
