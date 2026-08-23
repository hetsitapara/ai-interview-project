# PrepAI — AI-Powered Mock Interview Platform

PrepAI is a sophisticated, full-stack mock interview ecosystem designed to help candidates prepare for technical and behavioral interviews. Leveraging local LLMs (Ollama) and specialized Machine Learning modules, PrepAI providing real-time evaluation, resume analysis, and deep performance analytics.

---

## 🚀 Key Features

- **🎤 Dynamic AI Interviews** — Real-time Q&A sessions with behavioral and technical categories.
- **📄 Advanced Resume Analysis** — PDF parsing with skill extraction, profile summaries, and feedback.
- **📊 Premium Analytics Dashboard** — Visual progress tracking, session history, and deep proficiency insights.
- **📝 Multi-Format Mock Tests** — Support for MCQs, Rapid-Fire (Yes/No), and Coding challenges.
- **📄 Premium PDF Reports** — High-end, branded reports with AI rationale and actionable roadmaps.
- **🧠 Local AI Processing** — Privacy-first evaluation using Ollama (Llama 3 / Qwen) running on your own machine.
- **📚 Knowledge Hub** — Community interview experiences and curated learning blogs.

---

## 📁 Project Architecture

```bash
ai-interview-project/
├── backend/          # Node.js + Express.js API (Controllers, Models, Routes)
│   └── scripts/     # Data Seeding & Maintenance Utilities [Reorganized]
├── frontend/         # React.js + Vite (Advanced UI with Framer Motion)
├── ml/               # Python-based ML (Resume Parsing, Answer Scoring)
├── package.json      # Workspace Metadata
└── README.md         # Documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Chakra UI, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js 5, MongoDB (Mongoose), JWT, Nodemailer.
- **AI/ML**: Ollama (Llama 3 / Qwen 2.5), Python 3.10+, scikit-learn, textblob, pdfplumber.

---

## ⚙️ Initial Setup (From Scratch)

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Running locally on `27017` or a MongoDB Atlas URI
- **Python**: v3.9 or higher (for the ML resume parsing service)
- **Ollama**: [Download here](https://ollama.com) and pull models:
  ```bash
  ollama pull qwen2.5:1.5b-instruct-q4_0
  ```

### 2. Backend Installation
1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    Create a `.env` file in `backend/` using these values:
    ```env
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/ai-interview
    JWT_SECRET=your_jwt_secret_here
    EMAIL_USER=your_gmail@gmail.com
    EMAIL_PASS=your_gmail_app_password
    ```
4.  Launch the server:
    ```bash
    npm start
    ```

### 3. Frontend Installation
1.  Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the dev server:
    ```bash
    npm run dev
    ```
    *(Accessed via http://localhost:5173)*

### 4. ML Module Installation (Required for Resume Parsing)
1.  Navigate to the `ml/` directory:
    ```bash
    cd ml
    ```
2.  Setup virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # macOS/Linux
    # OR: venv\Scripts\activate  # Windows
    ```
3.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```

---

## 🧬 Seeding Initial Data

To populate your local database with default questions and admin credentials, run the following commands from the **`backend/`** directory:

```bash
# Core Seeding Scripts
node scripts/seed_admin.js          # Create default Admin (admin@prepai.com / admin123)
node scripts/seed_questions.js      # Seed general behavior & technical questions
node scripts/seedMcq.js             # Seed Multiple Choice questions
node scripts/seedYesNo.js           # Seed Rapid-Fire questions
node scripts/seedCoding.js          # Seed Coding challenge questions
node scripts/seedContent.js         # Seed roadmap & learning content
```

---

## 🤝 Project Contribution
Developed with focus on **Modern Aesthetics** and **User Experience**.
- **Ojas** 
- **Het Sitapara** 
