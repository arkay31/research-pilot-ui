# 🔍 ResearchPilot — Autonomous AI Research Agent

> An AI agent that searches the web, reads pages, and writes you a structured research report — powered by LangGraph, Groq, and Tavily.

🌐 **[Live Demo](https://research-pilot-ui.vercel.app)** · 💻 **[Backend Repo](https://github.com/arkay31/research-pilot)** · 🎨 **[Frontend Repo](https://github.com/arkay31/research-pilot-ui)**

---

## ✨ Features

- 🤖 **Autonomous ReAct agent loop** — reasons, acts, observes, and repeats using LangGraph
- 🔍 **Web search tool** — searches the web in real time using Tavily API
- 📄 **URL reader tool** — fetches and extracts full page content from any URL
- 💾 **Memory scratchpad** — saves key findings across tool calls
- ⚡ **Live streaming** — streams agent reasoning steps to the UI in real time via Server-Sent Events
- 📊 **Structured markdown reports** — beautifully rendered reports with tables, headers, and bullet points
- 🕘 **Search history** — keeps track of previous research sessions
- 📋 **Export** — copy or download reports as `.md` files

---

## 🏗️ Architecture

```
User Query
    │
    ▼
React Frontend (Vercel)
    │  SSE Stream
    ▼
FastAPI Backend (Render)
    │
    ▼
LangGraph ReAct Agent
    │
    ├──► web_search tool (Tavily API)
    ├──► read_url tool (BeautifulSoup)
    └──► save_finding tool (scratchpad memory)
    │
    ▼
Groq LLM (openai/gpt-oss-120b)
    │
    ▼
Structured Markdown Report
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Agent Framework** | LangGraph, LangChain |
| **LLM** | Groq (openai/gpt-oss-120b) |
| **Web Search** | Tavily API |
| **Backend** | FastAPI, Python |
| **Streaming** | Server-Sent Events (SSE) |
| **Frontend** | React, react-markdown |
| **Backend Deploy** | Render |
| **Frontend Deploy** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Tavily API key](https://app.tavily.com) (free)
- [Groq API key](https://console.groq.com) (free)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/arkay31/research-pilot.git
cd research-pilot

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "TAVILY_API_KEY=your_tavily_key" > .env
echo "GROQ_API_KEY=your_groq_key" >> .env

# Run the backend
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Clone the repo
git clone https://github.com/arkay31/research-pilot-ui.git
cd research-pilot-ui

# Install dependencies
npm install

# Run the frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
research-pilot/
├── main.py          # FastAPI app with SSE streaming endpoint
├── agent.py         # Standalone agent for testing
├── requirements.txt # Python dependencies
└── .env             # API keys (not committed)

research-pilot-ui/
├── src/
│   └── App.js       # React frontend with streaming UI
├── public/
└── package.json
```

---

## 🔄 How It Works

1. User submits a research query via the React frontend
2. Frontend sends a POST request to the FastAPI `/research` endpoint
3. FastAPI starts the LangGraph ReAct agent and streams events back
4. The agent autonomously:
   - Calls `web_search` to find relevant pages
   - Calls `read_url` to extract full content from the best result
   - Calls `save_finding` to store key insights in memory
   - Generates a structured markdown report
5. Each agent step streams live to the frontend as it happens
6. The final report renders with full markdown formatting

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [research-pilot-ui.vercel.app](https://research-pilot-ui.vercel.app) |
| Backend | Render | [research-pilot-api.onrender.com](https://research-pilot-api.onrender.com) |

> **Note:** The Render free tier spins down after inactivity. The first request may take 30-60 seconds to wake up.

---

## 📝 Resume Highlights

- Built a multi-step ReAct agent using LangGraph with 3 custom tools enabling autonomous research with live reasoning transparency
- Designed streaming FastAPI backend using Server-Sent Events to stream agent steps in real-time to a React frontend
- Optimized context window management to stay within API token limits — reduced payload size by 60% without losing output quality
- Deployed full-stack application publicly with search history, export, and copy features

---

## 🤝 Author

**Rakshit Kapoor**  
[GitHub](https://github.com/arkay31)

---

## 📄 License

MIT License — feel free to fork and build on this!
