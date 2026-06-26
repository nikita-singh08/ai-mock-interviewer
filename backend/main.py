import os
import uuid
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response

from models.schemas import (
    QuestionResponse,
    EvaluationResponse,
    ErrorResponse,
    ReportResponse,
)
from services.pdf_service import pdf_service
from services.gemini_service import gemini_service
from services.speech_service import speech_service
from services.report_service import report_service
from services.interview_service import interview_service

app = FastAPI(
    title="MockWise AI Interview API",
    description="Backend API for AI Mock Interview Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "MockWise API is running", "version": "1.0.0"}


@app.post("/api/upload-resume", response_model=QuestionResponse)
async def upload_resume(
    file: UploadFile = File(...),
    round: str = Form("technical"),
):
    try:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        resume_data = pdf_service.extract_resume_data(contents)

        if not resume_data["raw_text"]:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        questions = gemini_service.generate_questions(resume_data, round)

        if len(questions) < 5:
            default_questions = [
                "Tell me about yourself and your background.",
                "What is your greatest strength and how does it help you?",
                "Describe a challenging project you worked on.",
                "How do you handle tight deadlines and pressure?",
                "Where do you see yourself in five years?",
            ]
            questions = questions + default_questions
            questions = questions[:5]

        session_id = str(uuid.uuid4())
        interview_service.create_session(session_id, round)
        interview_service.start_session(session_id, questions)

        return QuestionResponse(questions=questions)

    except HTTPException:
        raise
    except Exception as e:
        print(f"[upload_resume] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.get("/api/get-audio")
async def get_audio(text: str = Query(..., description="Text to convert to speech")):
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text parameter is required")

        audio_bytes = speech_service.text_to_speech(text)

        return StreamingResponse(
            iter([audio_bytes]),
            media_type="audio/mp3",
            headers={
                "Content-Disposition": "inline; filename=question.mp3",
                "Content-Length": str(len(audio_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[get_audio] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Text-to-speech failed: {str(e)}")

@app.post("/api/process-answer", response_model=EvaluationResponse)
async def process_answer(
    audio: UploadFile = File(...),
    question: str = Form(...),
    questionIndex: int = Form(0),
):
    try:
        audio_bytes = await audio.read()
        if len(audio_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        mime_type = audio.content_type or "audio/webm"
        transcription = speech_service.speech_to_text(audio_bytes, mime_type)

        if transcription and not transcription.startswith("Could not") and not transcription.startswith("Speech recognition"):
            eval_result = gemini_service.evaluate_answer(question, transcription)
        else:
            eval_result = {
                "confidence": 50,
                "strengths": ["Attempted to answer"],
                "improvements": ["Speak more clearly for better transcription"],
            }
        print("Returning evaluation:")
        print(eval_result)

        return EvaluationResponse(
            transcription=transcription,
            confidence=eval_result.get("confidence", 50),
            strengths=eval_result.get("strengths", []),
            improvements=eval_result.get("improvements", []),
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[process_answer] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process answer: {str(e)}")


@app.post("/api/generate-report")
async def generate_report(
    candidate_name: str = Form("Candidate"),
    round_type: str = Form("technical"),
):
    try:
        evaluations = []
        for key in list(interview_service.sessions.keys()):
            session = interview_service.sessions[key]
            if session["status"] == "completed" or session["evaluations"]:
                evaluations = session["evaluations"]
                break

        if not evaluations:
            evaluations = [
                {
                    "confidence": 75,
                    "strengths": ["Technical knowledge", "Communication"],
                    "improvements": ["Depth of answers"],
                    "transcription": "Sample answer",
                }
            ]

        report_data = gemini_service.generate_report(evaluations, round_type)

        pdf_bytes = report_service.generate_pdf_report(
            candidate_name=candidate_name,
            round_type=round_type,
            question_count=len(evaluations),
            average_confidence=report_data.get("average_confidence", 70),
            strongest_skills=report_data.get("strongest_skills", []),
            major_improvements=report_data.get("major_improvements", []),
            interview_summary=report_data.get("interview_summary", ""),
            evaluations=evaluations,
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="mockwise_report_{candidate_name.replace(" ", "_")}.pdf"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[generate_report] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/api/audio")
async def get_audio_direct(text: str = Query(..., description="Text to convert to speech")):
    """Alias for /api/get-audio — returns TTS audio stream."""
    return await get_audio(text)


@app.get("/api/report")
async def get_report(
    candidate_name: str = Query("Candidate"),
    round_type: str = Query("technical"),
):
    """Alias for /api/generate-report — returns PDF report."""
    try:
        evaluations = []
        for key in list(interview_service.sessions.keys()):
            session = interview_service.sessions[key]
            if session["status"] == "completed" or session["evaluations"]:
                evaluations = session["evaluations"]
                break

        if not evaluations:
            evaluations = [
                {
                    "confidence": 75,
                    "strengths": ["Technical knowledge", "Communication"],
                    "improvements": ["Depth of answers"],
                    "transcription": "Sample answer",
                }
            ]

        report_data = gemini_service.generate_report(evaluations, round_type)

        pdf_bytes = report_service.generate_pdf_report(
            candidate_name=candidate_name,
            round_type=round_type,
            question_count=len(evaluations),
            average_confidence=report_data.get("average_confidence", 70),
            strongest_skills=report_data.get("strongest_skills", []),
            major_improvements=report_data.get("major_improvements", []),
            interview_summary=report_data.get("interview_summary", ""),
            evaluations=evaluations,
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="mockwise_report_{candidate_name.replace(" ", "_")}.pdf"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[get_report] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mockwise-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
