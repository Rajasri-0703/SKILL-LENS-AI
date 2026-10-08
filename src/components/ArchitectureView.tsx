import React, { useState } from 'react';
import {
  Server,
  Database,
  Layout,
  Cpu,
  Layers,
  Copy,
  Check,
  Code2,
  GitBranch,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useToast } from './Toast';

export const ArchitectureView: React.FC = () => {
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'directory' | 'schema' | 'fastapi' | 'docker'>('overview');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const DIRECTORY_TREE = `skilllens-ai/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/
│       │   └── skillLens.ts      # Domain models, Evidence, Readiness types
│       ├── utils/
│       │   ├── api.ts            # Client HTTP client calling FastAPI backend
│       │   └── storage.ts        # Local cache & theme persistence
│       └── components/
│           ├── Navbar.tsx
│           ├── LandingPage.tsx
│           ├── OnboardingFlow.tsx
│           ├── DashboardView.tsx
│           ├── SkillLensAssistant.tsx
│           ├── HistoryView.tsx
│           └── ProfileView.tsx
│
└── backend/                      # Python 3.12 + FastAPI + SQLAlchemy + Gemini
    ├── requirements.txt
    ├── Dockerfile
    ├── alembic.ini
    └── app/
        ├── __init__.py
        ├── main.py               # FastAPI entry point & CORS middleware
        ├── core/
        │   ├── config.py         # Pydantic BaseSettings (GEMINI_API_KEY, DATABASE_URL)
        │   └── security.py       # JWT authentication & password hashing
        ├── db/
        │   ├── session.py        # AsyncEngine & async_sessionmaker (PostgreSQL)
        │   ├── base.py           # DeclarativeBase metadata
        │   └── migrations/       # Alembic versioned migration scripts
        ├── models/               # SQLAlchemy ORM models
        │   ├── user.py           # User & Profile entities
        │   ├── skill.py          # UserSkill & RequiredSkill entities
        │   ├── analysis.py       # AnalysisResult & Evidences (JSONB)
        │   └── progress.py       # SkillProgress tracking entity
        ├── schemas/              # Pydantic v2 Request/Response validation models
        │   ├── user.py
        │   ├── analysis.py
        │   └── assistant.py
        ├── services/             # Core business logic & AI orchestration
        │   ├── gemini_analyzer.py # Google GenAI SDK integration
        │   ├── resume_parser.py  # PDF/DOCX text & entity extractor
        │   └── readiness_engine.py# Deterministic mathematical score calculator
        └── api/
            └── v1/
                ├── api.py        # APIRouter aggregation
                └── endpoints/
                    ├── auth.py
                    ├── resume.py
                    ├── analysis.py
                    ├── progress.py
                    └── assistant.py`;

  const SQL_SCHEMA = `-- PostgreSQL 16 Production Schema for SkillLens AI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education_level VARCHAR(100),
    current_field VARCHAR(150),
    target_role VARCHAR(150) NOT NULL,
    areas_of_interest TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512),
    raw_text TEXT,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Skills (Manually provided or detected)
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'Resume Project', 'Manually added by user'
    evidence_snippet TEXT,
    confidence_level VARCHAR(20) NOT NULL, -- 'High', 'Medium', 'Low'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Analyses Table (Stores complete gap reports)
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(150) NOT NULL,
    readiness_score INT NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
    matched_skills TEXT[] DEFAULT '{}',
    partial_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    additional_skills TEXT[] DEFAULT '{}',
    skill_evidences JSONB NOT NULL DEFAULT '[]'::jsonb,
    roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
    action_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_inputs_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Skill Progress Table
CREATE TABLE skill_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    target_role VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_skill_role UNIQUE (user_id, skill_name, target_role)
);

CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_progress_user ON skill_progress(user_id);`;

  const FASTAPI_SNIPPET = `# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="SkillLens AI API",
    version="1.0.0",
    description="AI-powered career skill gap analyzer backend with FastAPI & Gemini 3.8 Flash"
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SkillLens AI Backend"}`;

  const FASTAPI_SERVICE_SNIPPET = `# app/services/gemini_analyzer.py
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.analysis import AnalysisRequest, AnalysisResponse

client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options={'headers': {'User-Agent': 'aistudio-build'}}
)

async def analyze_skill_gaps(payload: AnalysisRequest) -> dict:
    prompt = f"""You are the core analysis engine of SkillLens AI.
Analyze user skills against target role '{payload.target_role}'.
DATA RULES:
1. Do NOT depend on external datasets.
2. Do NOT invent user skills, experience, or certifications.
3. Calculate readiness strictly: ((strong * 1.0 + partial * 0.5) / total_required) * 100.
4. Ground every evidence quote strictly in provided resume text or manual list.

INPUTS:
Target Role: {payload.target_role}
User Skills: {payload.user_skills}
Resume Data: {payload.resume_data}
Required Skills: {payload.required_skills}"""

    response = await client.aio.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    return response.text`;

  const DOCKER_COMPOSE = `# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: skilllens-postgres
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-skilllens_admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-secure_dev_pass}
      POSTGRES_DB: \${POSTGRES_DB:-skilllens_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U skilllens_admin -d skilllens_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: skilllens-fastapi
    restart: always
    environment:
      DATABASE_URL: postgresql+asyncpg://skilllens_admin:secure_dev_pass@db:5432/skilllens_db
      GEMINI_API_KEY: \${GEMINI_API_KEY}
      CORS_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000"
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: skilllens-react
    restart: always
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#080a10]">
      {/* Top Header */}
      <div className="pb-6 border-b border-indigo-500/20">
        <div className="text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
          Enterprise Implementation Spec
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
          Application Architecture & Codebase Structure
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Full production specification for React (Frontend) + Python FastAPI (Backend) + PostgreSQL (Database).
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center gap-2.5 text-cyan-400 font-extrabold text-sm mb-2">
            <Layout className="w-5 h-5" />
            <span>Frontend (React 19)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Componentized SPA with Vite, Tailwind CSS, Lucide icons, Dark Mode state machine, and client-side validation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-2.5 text-purple-400 font-extrabold text-sm mb-2">
            <Server className="w-5 h-5" />
            <span>Backend (Python FastAPI)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Asynchronous ASGI server powered by Uvicorn, Pydantic v2 data models, and the official Google GenAI SDK for Gemini 3.8 Flash.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center gap-2.5 text-emerald-400 font-extrabold text-sm mb-2">
            <Database className="w-5 h-5" />
            <span>Database (PostgreSQL 16)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ACID relational storage with UUID primary keys, JSONB columns for flexible AI outputs, and Alembic database migrations.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-indigo-500/25 overflow-x-auto text-xs shadow-inner">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 font-bold rounded-xl transition-all shrink-0 ${
            activeSection === 'overview'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Architectural Overview
        </button>
        <button
          onClick={() => setActiveSection('directory')}
          className={`px-4 py-2 font-bold rounded-xl transition-all shrink-0 ${
            activeSection === 'directory'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Codebase Directory Layout
        </button>
        <button
          onClick={() => setActiveSection('schema')}
          className={`px-4 py-2 font-bold rounded-xl transition-all shrink-0 ${
            activeSection === 'schema'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          PostgreSQL DDL Schema
        </button>
        <button
          onClick={() => setActiveSection('fastapi')}
          className={`px-4 py-2 font-bold rounded-xl transition-all shrink-0 ${
            activeSection === 'fastapi'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          FastAPI & Gemini Service
        </button>
        <button
          onClick={() => setActiveSection('docker')}
          className={`px-4 py-2 font-bold rounded-xl transition-all shrink-0 ${
            activeSection === 'docker'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Docker Compose Deploy
        </button>
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white">
            System Dataflow & Boundary Isolation
          </h3>

          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/20 font-mono text-xs text-cyan-300 space-y-2 overflow-x-auto shadow-inner">
            <div className="text-pink-400 font-bold">[User Browser / React SPA]</div>
            <div className="pl-4">│  1. Upload Resume (PDF) + Define Target Role & Required Skills</div>
            <div className="pl-4">▼</div>
            <div className="text-indigo-400 font-bold">[FastAPI API Gateway (CORS / JWT Auth)]</div>
            <div className="pl-4">│  2. Extract Text / Validate Inputs / Pydantic Schemas</div>
            <div className="pl-4">▼</div>
            <div className="text-purple-400 font-bold">[Services Layer]</div>
            <div className="pl-4">├── [Google GenAI SDK (gemini-3.8-flash)] ── Strict Grounding & Evidence Extraction</div>
            <div className="pl-4">└── [Readiness Engine] ────────────────────── Deterministic Mathematical Scoring</div>
            <div className="pl-4">▼</div>
            <div className="text-emerald-400 font-bold">[PostgreSQL 16 DB] ──────────────────────── Store User, Profile, Analysis, & Progress</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <span className="font-extrabold text-emerald-400 block mb-1">
                Zero Synthetic Data Guarantee:
              </span>
              <span className="text-slate-300">
                Backend routes never call third-party job scrapers or synthetic profile generators. Gemini receives strictly the uploaded resume and user inputs.
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30">
              <span className="font-extrabold text-cyan-400 block mb-1">
                Server-Side Key Isolation:
              </span>
              <span className="text-slate-300">
                GEMINI_API_KEY lives exclusively inside backend environment variables or secrets manager. No client bundle exposure.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DIRECTORY */}
      {activeSection === 'directory' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Complete Enterprise Codebase Structure
            </h3>
            <button
              onClick={() => copyToClipboard(DIRECTORY_TREE, 'dir')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
            >
              {copiedKey === 'dir' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'dir' ? 'Copied' : 'Copy Structure'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {DIRECTORY_TREE}
          </pre>
        </div>
      )}

      {/* SECTION 3: SCHEMA */}
      {activeSection === 'schema' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              PostgreSQL 16 Relational DDL Schema
            </h3>
            <button
              onClick={() => copyToClipboard(SQL_SCHEMA, 'sql')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
            >
              {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'sql' ? 'Copied' : 'Copy DDL'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* SECTION 4: FASTAPI & GEMINI */}
      {activeSection === 'fastapi' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              FastAPI Implementation & Gemini Service
            </h3>
            <button
              onClick={() => copyToClipboard(FASTAPI_SNIPPET + '\n\n' + FASTAPI_SERVICE_SNIPPET, 'fastapi')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
            >
              {copiedKey === 'fastapi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Python Code</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 block mb-1">
                Entrypoint: app/main.py
              </span>
              <pre className="p-5 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {FASTAPI_SNIPPET}
              </pre>
            </div>

            <div>
              <span className="text-xs font-bold text-pink-400 block mb-1">
                Service: app/services/gemini_analyzer.py
              </span>
              <pre className="p-5 rounded-2xl bg-slate-950 text-purple-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {FASTAPI_SERVICE_SNIPPET}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: DOCKER COMPOSE */}
      {activeSection === 'docker' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              docker-compose.yml Multi-Container Setup
            </h3>
            <button
              onClick={() => copyToClipboard(DOCKER_COMPOSE, 'docker')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
            >
              {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Compose File</span>
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-950 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {DOCKER_COMPOSE}
          </pre>
        </div>
      )}
    </div>
  );
};
