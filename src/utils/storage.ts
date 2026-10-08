import { AnalysisResult, ExtractedResume, SkillProgressRecord, UserProfile } from '../types/skillLens';

const KEYS = {
  USER_PROFILE: 'skilllens_profile',
  ACTIVE_ANALYSIS: 'skilllens_active_analysis',
  ANALYSIS_HISTORY: 'skilllens_analysis_history',
  EXTRACTED_RESUME: 'skilllens_extracted_resume',
  PROGRESS_RECORDS: 'skilllens_progress_records',
  THEME: 'skilllens_theme',
};

// Default profile placeholder when starting fresh
export const getDefaultProfile = (): UserProfile => ({
  id: 'usr_' + Date.now(),
  fullName: '',
  email: '',
  educationLevel: 'Bachelor of Technology / BS',
  currentField: 'Computer Science & Information Technology',
  areasOfInterest: ['Data Analysis', 'Software Engineering'],
  targetRole: 'Data Analyst',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const Storage = {
  getProfile: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getResume: (): ExtractedResume | null => {
    try {
      const data = localStorage.getItem(KEYS.EXTRACTED_RESUME);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveResume: (resume: ExtractedResume): void => {
    try {
      localStorage.setItem(KEYS.EXTRACTED_RESUME, JSON.stringify(resume));
    } catch (e) {
      console.error('Failed to save resume', e);
    }
  },

  getActiveAnalysis: (): AnalysisResult | null => {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_ANALYSIS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setActiveAnalysis: (analysis: AnalysisResult): void => {
    try {
      localStorage.setItem(KEYS.ACTIVE_ANALYSIS, JSON.stringify(analysis));
      // Also add to history if not duplicate
      Storage.addToHistory(analysis);
    } catch (e) {
      console.error('Failed to save active analysis', e);
    }
  },

  getHistory: (): AnalysisResult[] => {
    try {
      const data = localStorage.getItem(KEYS.ANALYSIS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory: (analysis: AnalysisResult): void => {
    try {
      const existing = Storage.getHistory();
      const filtered = existing.filter((item) => item.id !== analysis.id);
      const updated = [analysis, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem(KEYS.ANALYSIS_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add to history', e);
    }
  },

  deleteHistoryItem: (id: string): void => {
    try {
      const existing = Storage.getHistory();
      const updated = existing.filter((item) => item.id !== id);
      localStorage.setItem(KEYS.ANALYSIS_HISTORY, JSON.stringify(updated));
      const active = Storage.getActiveAnalysis();
      if (active?.id === id) {
        if (updated.length > 0) {
          localStorage.setItem(KEYS.ACTIVE_ANALYSIS, JSON.stringify(updated[0]));
        } else {
          localStorage.removeItem(KEYS.ACTIVE_ANALYSIS);
        }
      }
    } catch (e) {
      console.error('Failed to delete history item', e);
    }
  },

  getProgressRecords: (): Record<string, SkillProgressRecord> => {
    try {
      const data = localStorage.getItem(KEYS.PROGRESS_RECORDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveProgressRecord: (record: SkillProgressRecord): void => {
    try {
      const records = Storage.getProgressRecords();
      records[record.skillName.toLowerCase()] = record;
      localStorage.setItem(KEYS.PROGRESS_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save progress record', e);
    }
  },

  getTheme: (): 'dark' | 'light' => {
    try {
      const theme = localStorage.getItem(KEYS.THEME);
      if (theme === 'light' || theme === 'dark') {
        return theme;
      }
      return 'dark'; // Default Dark Mode as required
    } catch {
      return 'dark';
    }
  },

  setTheme: (theme: 'dark' | 'light'): void => {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  },
};
