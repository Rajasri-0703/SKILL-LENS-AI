import React, { useState } from 'react';
import { AnalysisResult } from '../types/skillLens';
import { Storage } from '../utils/storage';
import { useToast } from './Toast';
import {
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  TrendingUp,
  History,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HistoryViewProps {
  onSelectAnalysis: (analysis: AnalysisResult) => void;
  onStartNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectAnalysis,
  onStartNewAnalysis,
}) => {
  const { showToast } = useToast();
  const [history, setHistory] = useState<AnalysisResult[]>(() => Storage.getHistory());
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Storage.deleteHistoryItem(id);
    const updated = Storage.getHistory();
    setHistory(updated);
    showToast('Analysis removed from history', 'info');
  };

  const analysisA = history.find((h) => h.id === compareA);
  const analysisB = history.find((h) => h.id === compareB);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#080a10]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-500/20">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            Personal Analysis Archive
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Analysis History
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            All reports are stored locally for your account. Click any record to restore its full report.
          </p>
        </div>

        <button
          onClick={onStartNewAnalysis}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-purple-600/30 cursor-pointer transition-all"
        >
          <span>Run New Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 text-pink-200" />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-indigo-500/30 bg-slate-900/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              No previous analyses.
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Complete your first analysis to discover your skill gaps and track your readiness over time.
            </p>
          </div>
          <button
            onClick={onStartNewAnalysis}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md cursor-pointer"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item)}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  {item.targetRole}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.matchedCount} matched</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{item.missingCount} missing</span>
                  </span>
                  <span className="text-slate-500">
                    of {item.totalRequiredSkills} required skills
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Readiness</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 tabular-nums">
                    {item.readinessScore}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Historical Comparison Tool */}
      {history.length >= 2 && (
        <div className="mt-10 p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Compare Two Saved Analyses
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Select two analyses to observe your career readiness trajectory over time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Earlier Analysis:
              </label>
              <select
                value={compareA || ''}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
              >
                <option value="">Select report...</option>
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {new Date(h.timestamp).toLocaleDateString()} — {h.targetRole} ({h.readinessScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Later Analysis:
              </label>
              <select
                value={compareB || ''}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
              >
                <option value="">Select report...</option>
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {new Date(h.timestamp).toLocaleDateString()} — {h.targetRole} ({h.readinessScore}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {analysisA && analysisB && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">
                  Readiness Score Delta:
                </span>
                <span
                  className={`font-black tabular-nums text-base ${
                    analysisB.readinessScore - analysisA.readinessScore >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {analysisB.readinessScore - analysisA.readinessScore >= 0 ? '+' : ''}
                  {analysisB.readinessScore - analysisA.readinessScore}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3 text-slate-400">
                <div>
                  <div className="font-bold text-white">{analysisA.targetRole}</div>
                  <div>Score: <strong className="text-slate-200">{analysisA.readinessScore}%</strong></div>
                  <div>Matched: <strong className="text-emerald-400">{analysisA.matchedCount}</strong></div>
                </div>
                <div>
                  <div className="font-bold text-white">{analysisB.targetRole}</div>
                  <div>Score: <strong className="text-slate-200">{analysisB.readinessScore}%</strong></div>
                  <div>Matched: <strong className="text-emerald-400">{analysisB.matchedCount}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
