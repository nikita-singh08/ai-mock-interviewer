import json
import re
from typing import List, Dict
from core.config import GEMINI_API_KEY


class GeminiService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = "gemini-2.5-flash"
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except ImportError:
                raise RuntimeError("google-genai package not installed")
        return self._client

    def _generate(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")
        client = self._get_client()
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text or ""
        except Exception as e:
            print(f"[GeminiService] Generation error: {e}")
            raise

    def generate_questions(self, resume_data: Dict, round_type: str) -> List[str]:
        skills = ", ".join(resume_data.get("skills", []))
        projects = "\n".join(resume_data.get("projects", []))
        technologies = ", ".join(resume_data.get("technologies", []))

        if round_type == "technical":
            prompt = f"""You are an expert technical interviewer. Based on the candidate's resume, generate exactly 5 personalized technical interview questions.

Resume Skills: {skills}
Projects: {projects}
Technologies: {technologies}

Requirements:
- Questions should test problem-solving, DSA, system design, and technical depth
- Make questions personalized based on their skills and projects
- Each question should be 1-2 sentences
- Return ONLY a JSON array of 5 strings

Format: ["question1", "question2", "question3", "question4", "question5"]"""
        else:
            prompt = f"""You are an expert HR interviewer. Based on the candidate's resume, generate exactly 5 personalized HR/behavioral interview questions.

Resume Skills: {skills}
Projects: {projects}
Technologies: {technologies}

Requirements:
- Questions should test communication, teamwork, leadership, goals, strengths, and weaknesses
- Make questions personalized based on their background
- Each question should be 1-2 sentences
- Return ONLY a JSON array of 5 strings

Format: ["question1", "question2", "question3", "question4", "question5"]"""

        text = self._generate(prompt)
        return self._parse_json_array(text)

    def evaluate_answer(self, question: str, answer: str) -> Dict:
        prompt = f"""You are an expert interview evaluator. Evaluate the following interview answer and return a strict JSON response.

Question: {question}

Candidate Answer: {answer}

Evaluate on:
1. Confidence and clarity (0-100 score)
2. Key strengths (3-4 points)
3. Areas for improvement (3-4 points)

Return ONLY this JSON structure:
{{
  "confidence_score": 85,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}}"""

        text = self._generate(prompt)
        return self._parse_evaluation(text)

    def generate_report(self, evaluations: List[Dict], round_type: str) -> Dict:
        evals_text = "\n\n".join([
            f"Q{i+1}: Confidence={e.get('confidence', 0)}\nStrengths: {', '.join(e.get('strengths', []))}\nImprovements: {', '.join(e.get('improvements', []))}"
            for i, e in enumerate(evaluations)
        ])

        prompt = f"""You are an expert interview coach. Generate a final interview report based on these evaluations.

Round Type: {round_type}

Evaluations:
{evals_text}

Generate a comprehensive report with:
1. Average confidence score (0-100)
2. Strongest skills (3-5 points)
3. Major improvements needed (3-5 points)
4. Overall interview summary (2-3 sentences)

Return ONLY this JSON structure:
{{
  "average_confidence": 78,
  "strongest_skills": ["skill1", "skill2", "skill3"],
  "major_improvements": ["improvement1", "improvement2", "improvement3"],
  "interview_summary": "Overall summary here..."
}}"""

        text = self._generate(prompt)
        return self._parse_report(text)

    def _parse_json_array(self, text: str) -> List[str]:
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"```(?:json)?\s*", "", text)
            text = text.replace("```", "").strip()
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return [str(q) for q in data[:5]]
            if isinstance(data, dict) and "questions" in data:
                return [str(q) for q in data["questions"][:5]]
        except json.JSONDecodeError:
            pass
        lines = [l.strip().strip('"').strip("'") for l in text.split("\n") if l.strip()]
        return [l for l in lines if l and not l.startswith("[") and not l.endswith("]")][:5]

    def _parse_evaluation(self, text: str) -> Dict:
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"```(?:json)?\s*", "", text)
            text = text.replace("```", "").strip()
        try:
            data = json.loads(text)
            return {
                "confidence": int(data.get("confidence_score", 0)),
                "strengths": data.get("strengths", []),
                "improvements": data.get("improvements", []),
            }
        except (json.JSONDecodeError, ValueError):
            confidence = 70
            try:
                match = re.search(r'"confidence_score"[:\s]+(\d+)', text)
                if match:
                    confidence = int(match.group(1))
            except:
                pass
            return {
                "confidence": confidence,
                "strengths": ["Good attempt at answering"],
                "improvements": ["Could provide more detail"],
            }

    def _parse_report(self, text: str) -> Dict:
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"```(?:json)?\s*", "", text)
            text = text.replace("```", "").strip()
        try:
            data = json.loads(text)
            return {
                "average_confidence": int(data.get("average_confidence", 0)),
                "strongest_skills": data.get("strongest_skills", []),
                "major_improvements": data.get("major_improvements", []),
                "interview_summary": data.get("interview_summary", ""),
            }
        except (json.JSONDecodeError, ValueError):
            return {
                "average_confidence": 70,
                "strongest_skills": ["Technical knowledge demonstrated"],
                "major_improvements": ["Practice structured responses"],
                "interview_summary": "Good overall performance with room for improvement.",
            }


gemini_service = GeminiService()
