import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Layers,
  Compass,
  CheckCircle2,
  Calendar,
  Zap,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onViewHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis, onViewHowItWorks }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Colorful Ambient Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-500/25 blur-[120px] pointer-events-none rounded-full animate-pulse-slow" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/15 via-blue-600/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-teal-600/15 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Luminous Tagline Chip */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 inline shrink-0" />
            <span>AI Career Skill Gap Intelligence</span>
            <span aria-hidden="true" className="text-zinc-500">·</span>
            <span className="text-emerald-400">Zero Synthetic Datasets</span>
          </div>

          {/* Punchy Hero Title with Multi-color Gradients */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto text-balance">
            Understand Your Skills.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">
              Identify Your Gaps.
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400">
              Build Your Career.
            </span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance font-normal">
            SkillLens AI analyzes your current skills against your target role and provides an AI-powered skill gap analysis, readiness score, and personalized learning roadmap.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-xl shadow-purple-600/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            >
              <span>Analyze My Skills</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>

            <button
              onClick={onViewHowItWorks}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 transition-all border border-slate-700/80 hover:border-indigo-500/60 shadow-lg cursor-pointer"
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/30 backdrop-blur-md">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tabular-nums">
                100%
              </span>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Verified Evidence</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 backdrop-blur-md">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tabular-nums">
                4-Phase
              </span>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Targeted Roadmap</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 backdrop-blur-md">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tabular-nums">
                30-Day
              </span>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Action Plan</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/30 backdrop-blur-md">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 tabular-nums">
                Zero
              </span>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Fake Data Scrapers</div>
            </div>
          </div>

          {/* Transparent Data Pledge */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounded strictly on your inputs and resume. Never scrapes or fabricates candidate data.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Capabilities Section */}
      <section className="py-24 relative z-10 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 uppercase">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Engineered for Precision Career Discovery
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Transform ambiguous job requirements into a transparent, mathematically grounded development plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Emerald/Cyan */}
            <div className="group p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-emerald-500/30 hover:border-emerald-400/70 shadow-lg hover:shadow-emerald-500/15 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold mb-5 shadow-md shadow-emerald-500/30">
                <Target className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Skill Verification & Evidence
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Every detected skill is linked directly to where it was found in your resume projects or marked explicitly as user-provided. No hallucinations.
              </p>
            </div>

            {/* Card 2: Indigo/Violet */}
            <div className="group p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-indigo-500/30 hover:border-indigo-400/70 shadow-lg hover:shadow-indigo-500/15 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mb-5 shadow-md shadow-indigo-500/30">
                <Zap className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Honest Career Readiness Score
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Calculated strictly from the comparison between your skills and required role competencies. Clearly explained with transparent mathematical formulas.
              </p>
            </div>

            {/* Card 3: Rose/Amber */}
            <div className="group p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-pink-500/30 hover:border-pink-400/70 shadow-lg hover:shadow-pink-500/15 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white font-bold mb-5 shadow-md shadow-pink-500/30">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                4-Phase Roadmap & 30-Day Plan
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Sequences your learning from foundational prerequisites up to capstone portfolio projects, targeted only at your identified skill gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Workflow Section */}
      <section id="how-it-works" className="py-24 border-t border-slate-800/80 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 uppercase">
              Step-By-Step Workflow
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How SkillLens AI Works
            </h2>
            <p className="mt-3 text-base text-slate-400">
              A 5-step transparent workflow built on user verification.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Tell Us About Yourself',
                desc: 'Enter your background, current field of study, and areas of career interest.',
                color: 'from-cyan-500 to-blue-500 text-cyan-300 border-cyan-500/30',
              },
              {
                step: '02',
                title: 'Choose Your Career Goal',
                desc: 'Define your target role (e.g., Data Analyst, Full-Stack Engineer, Machine Learning Specialist).',
                color: 'from-indigo-500 to-purple-500 text-indigo-300 border-indigo-500/30',
              },
              {
                step: '03',
                title: 'Provide Current Skills & Resume',
                desc: 'Add your skills manually and optionally upload a PDF or DOCX resume to extract verified evidence.',
                color: 'from-fuchsia-500 to-pink-500 text-pink-300 border-pink-500/30',
              },
              {
                step: '04',
                title: 'Specify Role Requirements',
                desc: 'Enter the exact competencies requested by your target job description to eliminate external guesswork.',
                color: 'from-amber-500 to-rose-500 text-amber-300 border-amber-500/30',
              },
              {
                step: '05',
                title: 'Inspect Gaps & Track Milestones',
                desc: 'Explore your gap breakdown, test against confidence levels, and mark progress as you complete each phase.',
                color: 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/30',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-5 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all shadow-md"
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center font-mono font-black text-sm text-slate-950 shadow-md`}
                >
                  {item.step}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colorful Why Section */}
      <section className="py-24 border-t border-slate-800/80 bg-slate-950/70 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 uppercase">
              Truth in Career AI
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Why SkillLens AI is Different
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Built on transparent reasoning rather than black-box AI claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base mb-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Zero Hallucinated Evidence</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Other tools claim you have skills based on random assumptions. SkillLens AI only identifies skills that appear in your document or manual input, clearly citing exact excerpts.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base mb-3">
                <Layers className="w-5 h-5 shrink-0" />
                <span>Deterministic Mathematical Scoring</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your readiness score is calculated strictly from strong matches (1.0) and partial matches (0.5) against the required skills you defined.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 text-purple-400 font-bold text-base mb-3">
                <Compass className="w-5 h-5 shrink-0" />
                <span>User-Controlled Progress</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                AI never claims you completed a course or skill. You manually toggle statuses (Not Started, In Progress, Completed) and recalculate your profile on your own terms.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/80 border border-pink-500/30 shadow-lg">
              <div className="flex items-center gap-2.5 text-pink-400 font-bold text-base mb-3">
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>Grounded AI Assistant</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ask questions about your analysis in natural language. If data is missing, the assistant honestly tells you instead of making things up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Radiant Call To Action */}
      <section className="py-24 text-center relative z-10 border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Discover Your Skill Gaps?
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Takes less than 2 minutes. Get an immediate readiness score, gap priorities, and 30-day learning plan.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={onStartAnalysis}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-xl shadow-purple-600/35 transition-all cursor-pointer transform hover:scale-105"
              >
                <span>Start Free Skill Analysis</span>
                <ArrowRight className="w-4 h-4 text-pink-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-slate-800 bg-[#06080d] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">SkillLens AI</span>
            <span>—</span>
            <span className="text-slate-400">Career Skill Gap Analyzer</span>
          </div>

          <div className="text-center md:text-right max-w-md">
            <p className="text-slate-400">
              Your information is used to generate your personal skill analysis. SkillLens AI does not use external candidate datasets for your analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
