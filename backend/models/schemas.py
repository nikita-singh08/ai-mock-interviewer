from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class QuestionRequest(BaseModel):
    round_type: Literal["technical", "hr"] = Field(..., description="Interview round type")


class QuestionResponse(BaseModel):
    questions: List[str] = Field(..., description="List of exactly 5 interview questions")


class AudioRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")


class ProcessAnswerRequest(BaseModel):
    question: str = Field(..., description="The interview question asked")
    question_index: int = Field(0, description="Index of the current question")


class EvaluationResponse(BaseModel):
    transcription: str = Field("", description="Transcribed answer text")
    confidence: int = Field(0, ge=0, le=100, description="Confidence score 0-100")
    strengths: List[str] = Field(default_factory=list, description="List of strengths")
    improvements: List[str] = Field(default_factory=list, description="List of improvements")


class SessionData(BaseModel):
    total_questions: int = 5
    current_question: int = 0
    completed_questions: int = 0
    round_type: Literal["technical", "hr"] = "technical"
    status: Literal["idle", "live", "completed"] = "idle"


class ReportRequest(BaseModel):
    candidate_name: str = Field("Candidate", description="Candidate name")
    round_type: Literal["technical", "hr"] = "technical"
    evaluations: List[EvaluationResponse] = Field(default_factory=list)


class ReportResponse(BaseModel):
    average_confidence: int = Field(0, description="Average confidence score")
    strongest_skills: List[str] = Field(default_factory=list)
    major_improvements: List[str] = Field(default_factory=list)
    interview_summary: str = Field("", description="Overall summary")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
