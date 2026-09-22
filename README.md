# AI Mock Interviewer

An AI-powered mock interview platform that creates personalized interview sessions based on a candidate's resume.

Upload your resume, choose the type of interview you want to practice, answer AI-generated questions, and receive feedback on your responses to understand your interview readiness.

---

## ✨ Features

- 📄 **Resume-Based Interviews**  
  Generate personalized interview questions based on the candidate's resume.

- 🎯 **Multiple Interview Types**  
  Practice technical, HR, and resume-based interviews.

- 🤖 **AI-Powered Questions**  
  Generate relevant questions based on the candidate's skills, projects, education, and experience.

- 💬 **Interactive Interviews**  
  Answer questions one by one in a simulated interview environment.

- 📊 **Response Evaluation**  
  Analyze responses based on relevance, quality, strengths, and areas for improvement.

- 🎯 **Interview Readiness**  
  Receive feedback to understand your preparation level and identify areas that need improvement.

---

## 🔄 How It Works

```text
Resume Upload
      ↓
Resume Analysis
      ↓
Choose Interview Type
      ↓
AI Generates Questions
      ↓
Answer Questions
      ↓
AI Evaluates Responses
      ↓
Feedback & Readiness
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Start
- TanStack React Query
- Tailwind CSS
- React Hook Form
- Zod
- Radix UI
- Lucide React
- Recharts

### Backend

- Python

### Database & Services

- Supabase

### Development Tools

- Git
- GitHub
- ESLint
- Prettier

---

## 📁 Project Structure

```text
ai-mock-interviewer/
│
├── backend/
│   ├── core/
│   ├── models/
│   ├── services/
│   ├── main.py
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   ├── router.tsx
│   ├── server.ts
│   └── start.ts
│
├── supabase/
│   └── migrations/
│
├── package.json
├── package-lock.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Python 3
- A Supabase project

### Clone the Repository

```bash
git clone https://github.com/nikita-singh08/ai-mock-interviewer.git
cd ai-mock-interviewer
```

### Install Frontend Dependencies

```bash
npm install
```

### Start the Frontend

```bash
npm run dev
```

### Setup the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv .venv
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Configure the required environment variables using the provided `.env.example` file.

Keep API keys, database credentials, and other sensitive information private. Never commit your `.env` file to GitHub.

---

## 🎯 Use Case

AI Mock Interviewer is designed for students, developers, and job seekers who want to practice interviews using questions tailored to their own resume instead of relying only on generic question banks.

---

## 🔮 Future Improvements

- 🎙️ Voice-based interviews
- 🗣️ Speech and communication analysis
- 📈 Detailed interview performance analytics
- 📚 Interview history and progress tracking
- 🔄 Adaptive follow-up questions
- 🏢 Company-specific interview preparation
- 🎯 Personalized preparation recommendations

---

## 🌐 Repository

[GitHub Repository](https://github.com/nikita-singh08/ai-mock-interviewer)

---

## 👤 Author

**Nikita Singh**

[GitHub](https://github.com/nikita-singh08)
