# AI Interview Project

A full-stack AI-powered mock interview platform that helps users prepare for technical interviews. It supports text-based Q&A, MCQ, Yes/No, and coding interviews — with AI evaluation, resume analysis, session retry, and a rich analytics dashboard.

---

## 📁 Project Structure

```
ai-interview-project/
├── backend/        # Node.js + Express REST API
├── frontend/       # React + Vite frontend (Tailwind CSS + Chakra UI)
├── ml/             # Python ML module (resume parser, answer scoring)
└── package.json    # Root-level scripts
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool | Version |
|------|---------|
| Node.js | v18 or higher |
| npm | v9 or higher |
| Python | 3.10 or higher |
| MongoDB | Running locally on port `27017` OR have a MongoDB Atlas URI |
| Ollama | Installed and running (for AI evaluation) |

### Install Ollama

Download from [https://ollama.com](https://ollama.com) and then pull the required model:

```bash
ollama pull llama3
```

> Make sure Ollama is running (`ollama serve`) before starting the backend.

---

## 🔧 Environment Variables

### Backend — `backend/.env`

Create a file at `backend/.env` with the following:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

> `EMAIL_USER` and `EMAIL_PASS` are used for sending emails via Nodemailer (e.g., OTP/verification). Use a Gmail App Password, not your real password.

---

## 🚀 Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/hetsitapara/ai-interview-project.git
cd ai-interview-project
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend runs on: **http://localhost:5001**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on: **http://localhost:5173**

---

### 4. ML Module Setup (Optional — for Resume Parsing & Scoring)

```bash
cd ml
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

---

### 5. Seed the Database (Optional but Recommended)

Run these from inside the `backend/` directory after the server is running:

```bash
node seed_questions.js      # Seed interview questions
node seedMcq.js             # Seed MCQ questions
node seedYesNo.js           # Seed Yes/No questions
node seedCoding.js          # Seed coding questions
node seedContent.js         # Seed learning content
node seed_admin.js          # Create default admin user
```

---

## 🌐 Features

- 🎤 **AI Interview Sessions** — Text-based interviews with AI-generated questions and scoring via Ollama
- 📝 **MCQ, Yes/No, Coding Rounds** — Multiple interview formats
- 📄 **Resume Analysis** — Upload PDF resume, get skill extraction and feedback
- 📊 **Dashboard & Analytics** — Track performance across sessions
- 🔁 **Session Retry** — Retry any past interview with the exact same questions
- 📚 **Blog & Experiences** — Community experiences and learning resources
- 🗺️ **Roadmap** — Personalized learning path recommendations
- 🔐 **Auth** — JWT-based authentication with email verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Chakra UI, Framer Motion |
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| AI/LLM | Ollama (llama3) |
| ML | Python, scikit-learn, textblob, pdfplumber |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |

---

## 📌 Notes

- Make sure MongoDB is running before starting the backend.
- Make sure Ollama is running (`ollama serve`) before starting backend — AI scoring depends on it.
- `node_modules/`, `.env` files, and `ml/venv/` are **not included** in the repo — run `npm install` / `pip install -r requirements.txt` after cloning.
- The backend runs on port `5001` and the frontend on `5173` by default.

---

## 👥 Contributors

- **Ojas** — [feature/ojas branch]
- **Het Sitapara** — [feature/het branch]
