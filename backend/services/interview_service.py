from typing import List, Dict, Optional


class InterviewService:
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}

    def create_session(self, session_id: str, round_type: str) -> Dict:
        session = {
            "session_id": session_id,
            "total_questions": 5,
            "current_question": 0,
            "completed_questions": 0,
            "round_type": round_type,
            "status": "idle",
            "evaluations": [],
            "questions": [],
        }
        self.sessions[session_id] = session
        return session

    def start_session(self, session_id: str, questions: List[str]) -> Dict:
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        self.sessions[session_id]["questions"] = questions
        self.sessions[session_id]["status"] = "live"
        self.sessions[session_id]["current_question"] = 0
        return self.sessions[session_id]

    def record_evaluation(self, session_id: str, evaluation: Dict) -> Dict:
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        self.sessions[session_id]["evaluations"].append(evaluation)
        self.sessions[session_id]["completed_questions"] += 1
        self.sessions[session_id]["current_question"] += 1

        if self.sessions[session_id]["current_question"] >= self.sessions[session_id]["total_questions"]:
            self.sessions[session_id]["status"] = "completed"

        return self.sessions[session_id]

    def get_session(self, session_id: str) -> Optional[Dict]:
        return self.sessions.get(session_id)

    def get_all_evaluations(self, session_id: str) -> List[Dict]:
        session = self.sessions.get(session_id)
        if not session:
            return []
        return session.get("evaluations", [])

    def is_complete(self, session_id: str) -> bool:
        session = self.sessions.get(session_id)
        if not session:
            return False
        return session["status"] == "completed"


interview_service = InterviewService()
