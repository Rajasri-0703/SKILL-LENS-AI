export type SkillMatchStatus = 'strong_match' | 'partial_match' | 'missing' | 'additional';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  educationLevel: string;
  currentField: string;
  areasOfInterest: string[];
  targetRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedResume {
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  skills: string[];
  projects: {
    name: string;
    description: string;
    techUsed: string[];
  }[];
  education: {
    degree: string;
    institution?: string;
    year?: string;
  }[];
  experience: {
    role: string;
    company?: string;
    duration?: string;
    description?: string;
  }[];
  certifications: string[];
  toolsAndTech: string[];
  rawExcerpt?: string;
}

export interface SkillEvidenceItem {
  skillName: string;
  status: SkillMatchStatus;
  evidence: string;
  source: 'Resume Project' | 'Resume Experience' | 'Resume Education' | 'Resume Skills List' | 'Manually added by user' | 'User-provided skill';
  confidence: ConfidenceLevel;
  confidenceReason: string;
  priority: PriorityLevel;
  priorityReason: string;
  whyItMatters: string;
  recommendedNextStep: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  skills: string[];
  actionItems: string[];
}

export interface ActionPlanWeek {
  weekNumber: number;
  title: string;
  focus: string;
  tasks: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  targetRole: string;
  readinessScore: number;
  totalRequiredSkills: number;
  matchedCount: number;
  partialCount: number;
  missingCount: number;
  additionalCount: number;
  strongMatches: string[];
  partialMatches: string[];
  missingSkills: string[];
  additionalSkills: string[];
  skillEvidences: SkillEvidenceItem[];
  scoreExplanation: string;
  whyScoreBreakdown: {
    formula: string;
    matchedExplanation: string;
    partialExplanation: string;
    missingExplanation: string;
    firstFocus: string;
  };
  roadmap: RoadmapPhase[];
  actionPlan: ActionPlanWeek[];
  topSkillGaps: {
    skillName: string;
    priority: PriorityLevel;
    status: SkillMatchStatus;
    whyItMatters: string;
    nextStep: string;
  }[];
  userInputsSnapshot: {
    userSkills: string[];
    requiredSkills: string[];
    resumeFileName?: string;
  };
}

export interface SkillProgressRecord {
  skillName: string;
  status: ProgressStatus;
  targetRole: string;
  notes?: string;
  updatedAt: string;
}

export interface AnalysisComparison {
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  previousDate: string;
  currentDate: string;
  previousRole: string;
  currentRole: string;
  improvedSkills: string[];
  newSkills: string[];
  remainingGaps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
