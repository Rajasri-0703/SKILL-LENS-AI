import { AnalysisResult, ExtractedResume, SkillProgressRecord, UserProfile } from '../types/skillLens';

export async function extractResumeAPI(payload: {
  fileName?: string;
  fileType?: string;
  fileContent?: string; // base64
  rawText?: string;
}): Promise<ExtractedResume> {
  const response = await fetch('/api/extract-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to extract resume details');
  }

  const data = await response.json();
  return {
    fileName: payload.fileName || 'Uploaded_Document',
    uploadedAt: new Date().toISOString(),
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    education: Array.isArray(data.education) ? data.education : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    toolsAndTech: Array.isArray(data.toolsAndTech) ? data.toolsAndTech : [],
    rawExcerpt: data.rawExcerpt || '',
  };
}

export async function analyzeSkillsAPI(payload: {
  userProfile: UserProfile;
  targetRole: string;
  userSkills: string[];
  resumeData?: ExtractedResume | null;
  requiredSkills: string[];
}): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Skill analysis failed');
  }

  return response.json();
}

export async function askSkillAssistantAPI(payload: {
  question: string;
  currentAnalysis: AnalysisResult | null;
  userProfile: UserProfile | null;
  chatHistory?: Array<{ sender: string; text: string }>;
}): Promise<string> {
  const response = await fetch('/api/chat-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Unable to contact SkillLens Assistant');
  }

  const data = await response.json();
  return data.answer || "I don't have enough information to determine that.";
}

export async function recalculateReadinessAPI(payload: {
  baseAnalysis: AnalysisResult;
  progressRecords: Record<string, SkillProgressRecord>;
}): Promise<{ updatedAnalysis: AnalysisResult; comparison: any }> {
  const response = await fetch('/api/recalculate-readiness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to recalculate readiness score');
  }

  return response.json();
}

export async function fetchArchitectureBlueprintAPI(): Promise<any> {
  const response = await fetch('/api/architecture-blueprint');
  if (!response.ok) {
    throw new Error('Failed to load architecture blueprint');
  }
  return response.json();
}
