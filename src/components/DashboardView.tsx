import React, { useState } from 'react';
import {
  AnalysisResult,
  SkillEvidenceItem,
  SkillMatchStatus,
  SkillProgressRecord,
  AnalysisComparison,
} from '../types/skillLens';
import { Storage } from '../utils/storage';
import { recalculateReadinessAPI } from '../utils/api';
import { useToast } from './Toast';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  Clock,
  Circle,
  MessageSquare,
  Eye,
  Award,
  Zap,
  Flame,
} from 'lucide-react';

interface DashboardViewProps {
  analysis: AnalysisResult;
  onOpenAssistant: () => void;
  onReanalyze: () => void;
  onAnalysisUpdated: (newAnalysis: AnalysisResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  onOpenAssistant,
  onReanalyze,
  onAnalysisUpdated,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SkillMatchStatus>('all');
  const [selectedEvidenceSkill, setSelectedEvidenceSkill] = useState<SkillEvidenceItem | null>(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const [progressRecords, setProgressRecords] = useState<Record<string, SkillProgressRecord>>(() =>
    Storage.getProgressRecords()
  );
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recentComparison, setRecentComparison] = useState<AnalysisComparison | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'gaps' | 'roadmap' | 'progress'>('overview');

  const handleProgressChange = (skillName: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    const updated: SkillProgressRecord = {
      skillName,
      status: newStatus,
      targetRole: analysis.targetRole,
      updatedAt: new Date().toISOString(),
    };
    Storage.saveProgressRecord(updated);
    setProgressRecords((prev) => ({
      ...prev,
      [skillName.toLowerCase()]: updated,
    }));
    showToast(`Updated progress for "${skillName}" to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const { updatedAnalysis, comparison } = await recalculateReadinessAPI({
        baseAnalysis: analysis,
        progressRecords,
      });
      Storage.setActiveAnalysis(updatedAnalysis);
      onAnalysisUpdated(updatedAnalysis);
      setRecentComparison(comparison);
      showToast(`Skill Profile Recalculated! Readiness is now ${updatedAnalysis.readinessScore}%`, 'success');
    } catch {
      showToast('Failed to recalculate skill profile.', 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  const filteredEvidences = (analysis.skillEvidences || []).filter((item) => {
    const matchesSearch = item.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: SkillMatchStatus) => {
    switch (status) {
      case 'strong_match':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strong Match</span>
          </span>
        );
      case 'partial_match':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Partial Match</span>
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Missing</span>
          </span>
        );
      case 'additional':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Additional</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>High Priority</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Medium Priority</span>
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Low Priority</span>
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: 'High' | 'Medium' | 'Low') => {
    switch (confidence) {
      case 'High':
        return <span className="text-xs font-bold text-emerald-400">High Confidence</span>;
      case 'Medium':
        return <span className="text-xs font-bold text-amber-300">Medium Confidence</span>;
      case 'Low':
        return <span className="text-xs font-bold text-slate-400">Low Confidence</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#080a10]">
      {/* Top Header & Assistant Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            <span>Career Readiness Dashboard</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Analyzed {new Date(analysis.timestamp).toLocaleDateString()}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Target Role:</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              {analysis.targetRole}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-purple-600/30 transition-all cursor-pointer transform hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-pink-200" />
            <span>SkillLens Assistant</span>
          </button>

          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Improvement Alert banner if recently recalculated */}
      {recentComparison && (
        <div className="p-4 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 flex items-center justify-between gap-4 shadow-lg shadow-indigo-500/10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-sm text-slate-100">
              <span className="font-bold">Your Progress Recalculated: </span>
              Previous Readiness was <span className="font-semibold text-slate-300">{recentComparison.previousScore}%</span>, Current Readiness is{' '}
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{recentComparison.currentScore}%</span>{' '}
              ({recentComparison.scoreDelta >= 0 ? `+${recentComparison.scoreDelta}%` : `${recentComparison.scoreDelta}%`}).
            </div>
          </div>
          <button
            onClick={() => setRecentComparison(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP 4 COLORFUL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Career Readiness with Radiant Gradient */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-slate-900/90 border border-indigo-500/40 shadow-lg shadow-indigo-500/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>Career Readiness</span>
            <button
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
            >
              <span>Formula</span>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 tabular-nums">
              {analysis.readinessScore}%
            </span>
            <span className="text-xs font-semibold text-slate-400">score</span>
          </div>
          {/* Radiant Progress Bar */}
          <div className="mt-4 w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                analysis.readinessScore >= 70
                  ? 'from-emerald-500 to-cyan-400'
                  : analysis.readinessScore >= 40
                  ? 'from-amber-500 to-orange-400'
                  : 'from-rose-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(100, analysis.readinessScore)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 leading-tight">
            Based strictly on {analysis.totalRequiredSkills} user-defined competencies.
          </p>
        </div>

        {/* Card 2: Target Role */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-900/90 border border-purple-500/40 shadow-lg shadow-purple-500/10 flex flex-col justify-between">
          <div className="text-xs font-bold text-purple-300">
            Target Role
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-white leading-snug">
              {analysis.targetRole}
            </span>
          </div>
          <div className="mt-4 text-xs font-semibold text-purple-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>{analysis.totalRequiredSkills} Required Competencies</span>
          </div>
        </div>

        {/* Card 3: Skills Matched with Emerald Accent */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 flex flex-col justify-between">
          <div className="text-xs font-bold text-emerald-300">
            Skills Matched
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-emerald-400 tabular-nums">
              {analysis.matchedCount}
            </span>
            <span className="text-xs font-bold text-amber-300">
              +{analysis.partialCount} partial
            </span>
          </div>
          <div className="mt-4 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified in profile & resume</span>
          </div>
        </div>

        {/* Card 4: Skills to Improve with Rose/Coral Accent */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/90 border border-rose-500/40 shadow-lg shadow-rose-500/10 flex flex-col justify-between">
          <div className="text-xs font-bold text-rose-300">
            Skills to Improve
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-rose-400 tabular-nums">
              {analysis.missingCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              gaps identified
            </span>
          </div>
          <div className="mt-4 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>High/Medium priority gaps</span>
          </div>
        </div>
      </div>

      {/* HOW IS MY SCORE CALCULATED MODAL / DRAWER */}
      {showScoreDetails && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-base">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>How is my readiness score calculated?</span>
            </div>
            <button
              onClick={() => setShowScoreDetails(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {analysis.scoreExplanation}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs font-mono text-cyan-300">
            {analysis.whyScoreBreakdown?.formula ||
              `Score = ((${analysis.matchedCount} Strong × 1.0) + (${analysis.partialCount} Partial × 0.5)) / ${analysis.totalRequiredSkills} Required × 100 = ${analysis.readinessScore}%`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="font-bold text-emerald-400 block mb-1">Strong Matches (1.0 weight):</span>{' '}
              <span className="text-slate-300">{analysis.whyScoreBreakdown?.matchedExplanation || analysis.strongMatches.join(', ') || 'None'}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <span className="font-bold text-amber-300 block mb-1">Partial Matches (0.5 weight):</span>{' '}
              <span className="text-slate-300">{analysis.whyScoreBreakdown?.partialExplanation || analysis.partialMatches.join(', ') || 'None'}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
              <span className="font-bold text-rose-400 block mb-1">Missing Gaps (0.0 weight):</span>{' '}
              <span className="text-slate-300">{analysis.whyScoreBreakdown?.missingExplanation || analysis.missingSkills.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD NAVIGATION TABS (Vibrant Dark Segmented Controls) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-indigo-500/25 overflow-x-auto shadow-inner">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview & Next Steps
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Skill Comparison Table
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'gaps'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Skill Gap Breakdown
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Learning Roadmap & 30-Day Plan
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          My Progress & Recalculate
        </button>
      </div>

      {/* TAB 1: OVERVIEW & NEXT STEPS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Skill Distribution Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Skill Overview Visualization</span>
            </h3>

            {/* Glowing multi-color bar */}
            <div className="w-full h-5 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${(analysis.matchedCount / Math.max(1, analysis.totalRequiredSkills)) * 100}%`,
                }}
                title={`Strong Matches: ${analysis.matchedCount}`}
              />
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
                style={{
                  width: `${(analysis.partialCount / Math.max(1, analysis.totalRequiredSkills)) * 100}%`,
                }}
                title={`Partial Matches: ${analysis.partialCount}`}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                style={{
                  width: `${(analysis.missingCount / Math.max(1, analysis.totalRequiredSkills)) * 100}%`,
                }}
                title={`Missing Skills: ${analysis.missingCount}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-slate-300">Strong Match:</span>
                <span className="font-extrabold text-emerald-400">{analysis.matchedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span className="text-slate-300">Partial Match:</span>
                <span className="font-extrabold text-amber-300">{analysis.partialCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-400 shadow-sm shadow-rose-400/50" />
                <span className="text-slate-300">Missing Gaps:</span>
                <span className="font-extrabold text-rose-400">{analysis.missingCount}</span>
              </div>
              {analysis.additionalCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  <span className="text-slate-300">Additional Competencies:</span>
                  <span className="font-extrabold text-cyan-300">{analysis.additionalCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Skill Gaps */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Top Skill Gaps</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The 3 most critical missing or partial competencies required for {analysis.targetRole}.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('gaps')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
              >
                <span>View all gaps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {analysis.topSkillGaps && analysis.topSkillGaps.length > 0 ? (
                analysis.topSkillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-950 flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{gap.skillName}</span>
                        {getPriorityBadge(gap.priority)}
                      </div>
                      <div className="mt-2">
                        {getStatusBadge(gap.status)}
                      </div>
                      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                        {gap.whyItMatters}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        Recommended Next Step:
                      </span>
                      <span className="text-xs text-slate-200 font-medium">
                        {gap.nextStep}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-6 text-sm text-emerald-400">
                  No critical skill gaps identified! You match all required competencies.
                </div>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Why did I get this score?</span>
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                <strong className="text-white">Analysis Summary:</strong> {analysis.whyScoreBreakdown?.firstFocus}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="font-bold text-emerald-400 block mb-1">
                    What matched:
                  </span>
                  <p className="text-slate-300">
                    {analysis.strongMatches.length > 0 ? analysis.strongMatches.join(', ') : 'No exact strong matches found.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30">
                  <span className="font-bold text-rose-400 block mb-1">
                    Primary focus to bridge:
                  </span>
                  <p className="text-slate-300">
                    {analysis.missingSkills.length > 0 ? analysis.missingSkills.slice(0, 3).join(', ') : 'All required competencies fulfilled.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILL COMPARISON TABLE */}
      {activeTab === 'comparison' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Visual Skill Comparison Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed verification, confidence metrics, and evidence source for every skill.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="strong_match">Strong Match</option>
                <option value="partial_match">Partial Match</option>
                <option value="missing">Missing</option>
                <option value="additional">Additional</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3.5 px-3 font-bold">Required / Profile Skill</th>
                  <th className="py-3.5 px-3 font-bold">Your Status</th>
                  <th className="py-3.5 px-3 font-bold">Evidence Confidence</th>
                  <th className="py-3.5 px-3 font-bold">Priority</th>
                  <th className="py-3.5 px-3 font-bold">Evidence Source</th>
                  <th className="py-3.5 px-3 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEvidences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No skills match the current search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvidences.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3 font-extrabold text-white">
                        {item.skillName}
                      </td>
                      <td className="py-3.5 px-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-3">
                        {getConfidenceBadge(item.confidence)}
                      </td>
                      <td className="py-3.5 px-3">
                        {getPriorityBadge(item.priority)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                        {item.source}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEvidenceSkill(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SKILL GAP BREAKDOWN */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Your Skill Gap Analysis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Every missing or partial competency ranked by urgency without external market assumptions.
              </p>
            </div>

            <div className="space-y-4">
              {analysis.skillEvidences
                .filter((item) => item.status === 'missing' || item.status === 'partial_match')
                .map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold text-white">
                          {gap.skillName}
                        </span>
                        {getStatusBadge(gap.status)}
                      </div>
                      {getPriorityBadge(gap.priority)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="font-bold text-slate-200 block mb-1">
                          Why It Matters:
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {gap.whyItMatters}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30">
                        <span className="font-bold text-cyan-400 block mb-1">
                          Recommended Next Step:
                        </span>
                        <p className="text-slate-300 font-medium leading-relaxed">
                          {gap.recommendedNextStep}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <strong className="text-slate-300">Priority Reasoning:</strong> {gap.priorityReason}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERSONALIZED ROADMAP & 30-DAY PLAN WITH COLORFUL PHASES */}
      {activeTab === 'roadmap' && (
        <div className="space-y-8">
          {/* 4-Phase Roadmap */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>My Learning Roadmap</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generated exclusively from your identified skill gaps. Progress from foundations to portfolio capstones.
              </p>
            </div>

            <div className="space-y-5">
              {analysis.roadmap.map((phase) => {
                // Different colorful glow for each phase
                const phaseStyles = [
                  'border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 to-slate-950',
                  'border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 to-slate-950',
                  'border-purple-500/40 bg-gradient-to-r from-purple-950/30 to-slate-950',
                  'border-pink-500/40 bg-gradient-to-r from-pink-950/30 to-slate-950',
                ][phase.phaseNumber - 1] || 'border-slate-800 bg-slate-950';

                const badgeStyles = [
                  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                  'bg-purple-500/20 text-purple-300 border-purple-500/40',
                  'bg-pink-500/20 text-pink-300 border-pink-500/40',
                ][phase.phaseNumber - 1] || 'bg-slate-800 text-slate-300 border-slate-700';

                return (
                  <div
                    key={phase.phaseNumber}
                    className={`p-6 rounded-2xl border ${phaseStyles} space-y-3 shadow-md`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-mono font-black border ${badgeStyles}`}>
                        Phase {phase.phaseNumber}
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        {phase.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {phase.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-400 mr-1">Skills:</span>
                      {phase.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700 text-white"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-xs font-bold text-cyan-400 block">
                        Recommended Action Items:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                        {phase.actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 30-Day Action Plan */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-400" />
                <span>Your Next 30-Day Action Plan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Practical weekly focus milestones based on your gaps. (Recommendation only — not marked as completed).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.actionPlan.map((week) => {
                const weekBorder = [
                  'border-cyan-500/30',
                  'border-indigo-500/30',
                  'border-purple-500/30',
                  'border-emerald-500/30',
                ][week.weekNumber - 1] || 'border-slate-800';

                return (
                  <div
                    key={week.weekNumber}
                    className={`p-5 rounded-2xl border ${weekBorder} bg-slate-950/70 space-y-3 shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">
                        {week.title}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                        Week {week.weekNumber}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300">
                      Primary Focus: <span className="font-normal text-slate-400">{week.focus}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 pt-1">
                      {week.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Circle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MY PROGRESS & RECALCULATE */}
      {activeTab === 'progress' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>My Learning Progress</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                You control the status. Mark skills as Not Started, In Progress, or Completed, then recalculate your readiness profile.
              </p>
            </div>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>Recalculate My Skill Profile</span>
            </button>
          </div>

          <div className="space-y-3">
            {analysis.userInputsSnapshot.requiredSkills.map((skillName) => {
              const record = progressRecords[skillName.toLowerCase()];
              const currentStatus = record?.status || (analysis.strongMatches.includes(skillName) ? 'completed' : 'not_started');

              return (
                <div
                  key={skillName}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60 gap-3"
                >
                  <div>
                    <span className="font-extrabold text-sm text-white">{skillName}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Required competency for {analysis.targetRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleProgressChange(skillName, 'not_started')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        currentStatus === 'not_started'
                          ? 'bg-slate-800 text-white border-slate-600'
                          : 'text-slate-500 hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      ○ Not Started
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(skillName, 'in_progress')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        currentStatus === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'text-slate-500 hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      ◐ In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(skillName, 'completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        currentStatus === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'text-slate-500 hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      ✓ Completed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SKILL EVIDENCE INSPECTION MODAL */}
      {selectedEvidenceSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Skill Evidence & Verification
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedEvidenceSkill.skillName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceSkill(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400">Match Status:</span>
                <div>{getStatusBadge(selectedEvidenceSkill.status)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-400">Evidence Found:</span>
                <p className="text-white italic">
                  "{selectedEvidenceSkill.evidence}"
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Source: <strong className="text-cyan-300">{selectedEvidenceSkill.source}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">Evidence Confidence:</span>
                  <div>{getConfidenceBadge(selectedEvidenceSkill.confidence)}</div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Reason: {selectedEvidenceSkill.confidenceReason}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">Smart Priority:</span>
                  <div>{getPriorityBadge(selectedEvidenceSkill.priority)}</div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Why: {selectedEvidenceSkill.priorityReason}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvidenceSkill(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
