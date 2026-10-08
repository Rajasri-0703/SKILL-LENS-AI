import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { SkillLensAssistant } from './components/SkillLensAssistant';
import { AnalysisResult, UserProfile } from './types/skillLens';
import { Storage, getDefaultProfile } from './utils/storage';
import { Sparkles, BarChart3, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'analyze' | 'dashboard' | 'history' | 'profile'
  >('home');

  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(() =>
    Storage.getActiveAnalysis()
  );

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    Storage.getProfile() || getDefaultProfile()
  );

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Sync profile when storage changes
  useEffect(() => {
    const prof = Storage.getProfile();
    if (prof) setUserProfile(prof);
  }, [currentTab]);

  const handleAnalysisComplete = (newAnalysis: AnalysisResult) => {
    setActiveAnalysis(newAnalysis);
    setCurrentTab('dashboard');
  };

  const handleSelectHistoryAnalysis = (analysis: AnalysisResult) => {
    setActiveAnalysis(analysis);
    Storage.setActiveAnalysis(analysis);
    setCurrentTab('dashboard');
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#07090e] text-slate-100 transition-colors duration-200 flex flex-col font-sans">
          {/* Main Top Navigation */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            hasActiveAnalysis={!!activeAnalysis}
          />

          {/* Tab Content */}
          <main className="flex-1">
            {currentTab === 'home' && (
              <LandingPage
                onStartAnalysis={() => setCurrentTab('analyze')}
                onViewHowItWorks={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setCurrentTab('analyze');
                  }
                }}
              />
            )}

            {currentTab === 'analyze' && (
              <OnboardingFlow
                onAnalysisComplete={handleAnalysisComplete}
                initialProfile={userProfile}
              />
            )}

            {currentTab === 'dashboard' && (
              <>
                {activeAnalysis ? (
                  <DashboardView
                    analysis={activeAnalysis}
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onReanalyze={() => setCurrentTab('analyze')}
                    onAnalysisUpdated={(updated) => setActiveAnalysis(updated)}
                  />
                ) : (
                  /* Empty state for dashboard (Section 33) */
                  <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                        No analysis yet.
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Complete your first analysis to discover your skill gaps and unlock your career readiness dashboard.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('analyze')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Your First Analysis</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {currentTab === 'history' && (
              <HistoryView
                onSelectAnalysis={handleSelectHistoryAnalysis}
                onStartNewAnalysis={() => setCurrentTab('analyze')}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView onReanalyze={() => setCurrentTab('analyze')} />
            )}
          </main>

          {/* SkillLens Grounded Assistant Chat Modal (Section 21) */}
          <SkillLensAssistant
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            currentAnalysis={activeAnalysis}
            userProfile={userProfile}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
