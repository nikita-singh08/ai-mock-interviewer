import pdfplumber
import io
from typing import Dict, List


class PDFService:
    def extract_text(self, file_bytes: bytes) -> str:
        text = ""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"[PDFService] Error extracting text: {e}")
            raise ValueError(f"Failed to parse PDF: {e}")
        return text.strip()

    def extract_resume_data(self, file_bytes: bytes) -> Dict:
        text = self.extract_text(file_bytes)

        skills = self._extract_skills(text)
        projects = self._extract_projects(text)
        education = self._extract_education(text)
        technologies = self._extract_technologies(text)

        return {
            "raw_text": text,
            "skills": skills,
            "projects": projects,
            "education": education,
            "technologies": technologies,
        }

    def _extract_skills(self, text: str) -> List[str]:
        common_skills = [
            "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
            "react", "angular", "vue", "node.js", "express", "django", "flask",
            "sql", "mongodb", "postgresql", "mysql", "redis",
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
            "machine learning", "deep learning", "nlp", "computer vision",
            "data structures", "algorithms", "system design", "microservices",
            "git", "ci/cd", "jenkins", "github actions",
        ]
        found = []
        lower = text.lower()
        for skill in common_skills:
            if skill in lower:
                found.append(skill.title() if len(skill) > 3 else skill.upper())
        return list(set(found))

    def _extract_projects(self, text: str) -> List[str]:
        lines = text.split("\n")
        projects = []
        for line in lines:
            lower = line.lower()
            if any(k in lower for k in ["project", "built", "developed", "created", "implemented"]):
                clean = line.strip().strip("-•*")
                if len(clean) > 10 and len(clean) < 200:
                    projects.append(clean)
        return projects[:5]

    def _extract_education(self, text: str) -> List[str]:
        lines = text.split("\n")
        edu = []
        for line in lines:
            lower = line.lower()
            if any(k in lower for k in ["bachelor", "master", "phd", "degree", "university", "college", "b.s", "m.s", "b.tech", "m.tech"]):
                clean = line.strip().strip("-•*")
                if len(clean) > 5:
                    edu.append(clean)
        return edu[:3]

    def _extract_technologies(self, text: str) -> List[str]:
        tech_keywords = [
            "react", "angular", "vue", "svelte", "next.js", "nuxt",
            "node", "express", "fastapi", "django", "flask", "spring",
            "postgresql", "mysql", "mongodb", "dynamodb", "firebase",
            "aws", "gcp", "azure", "heroku", "vercel", "netlify",
            "docker", "kubernetes", "terraform", "ansible",
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
            "kafka", "rabbitmq", "redis", "elasticsearch",
        ]
        found = []
        lower = text.lower()
        for tech in tech_keywords:
            if tech in lower:
                found.append(tech.title() if len(tech) > 2 else tech.upper())
        return list(set(found))


pdf_service = PDFService()
