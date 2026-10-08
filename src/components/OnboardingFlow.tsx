import React, { useState, useRef } from 'react';
import {
  ExtractedResume,
  UserProfile,
  AnalysisResult,
} from '../types/skillLens';
import { extractResumeAPI, analyzeSkillsAPI } from '../utils/api';
import { Storage } from '../utils/storage';
import { useToast } from './Toast';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Sparkles,
  Loader2,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface OnboardingFlowProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  initialProfile?: UserProfile | null;
}

const COMMON_ROLES = [
  'Data Analyst',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Engineer',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
  'Product Manager',
  'Cybersecurity Analyst',
];

const ROLE_REQUIRED_PRESETS: Record<string, string[]> = {
  'Data Analyst': ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics', 'Tableau', 'Data Cleaning'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Tailwind CSS', 'Git', 'REST APIs'],
  'Backend Developer': ['Python', 'SQL', 'Node.js / Express', 'RESTful APIs', 'PostgreSQL', 'Docker', 'Git'],
  'Full-Stack Engineer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Git', 'REST APIs', 'Docker', 'Tailwind CSS'],
  'Machine Learning Engineer': ['Python', 'PyTorch / TensorFlow', 'Mathematics & Statistics', 'Pandas', 'NumPy', 'Scikit-Learn', 'Git'],
  'DevOps / Cloud Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS / Cloud Services', 'CI/CD Pipelines', 'Git', 'Bash Scripting'],
  'Product Manager': ['Product Strategy', 'Agile / Scrum', 'User Research', 'Data Analysis', 'Roadmapping', 'Wireframing'],
  'Cybersecurity Analyst': ['Network Security', 'Linux', 'Vulnerability Assessment', 'Firewalls', 'SIEM Tools', 'Incident Response'],
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onAnalysisComplete,
  initialProfile,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Profile
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [educationLevel, setEducationLevel] = useState(
    initialProfile?.educationLevel || 'Bachelor of Technology / BS'
  );
  const [currentField, setCurrentField] = useState(
    initialProfile?.currentField || 'Computer Science & Engineering'
  );
  const [interestInput, setInterestInput] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(
    initialProfile?.areasOfInterest || ['Data Analytics', 'Software Engineering']
  );

  // Step 2: Goal
  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole || 'Data Analyst');

  // Step 3: Current Skills
  const [skillInput, setSkillInput] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([
    'Python',
    'SQL',
    'Excel',
  ]);

  // Step 4: Resume
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<ExtractedResume | null>(null);
  const [isEditingResumeInsights, setIsEditingResumeInsights] = useState(false);
  const [editedResumeSkills, setEditedResumeSkills] = useState<string>('');
  const [resumeTextPasted, setResumeTextPasted] = useState('');
  const [showPasteFallback, setShowPasteFallback] = useState(false);

  // Step 5: Required Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    ROLE_REQUIRED_PRESETS['Data Analyst'] || ['SQL', 'Python', 'Excel', 'Power BI']
  );
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [editingReqSkillIndex, setEditingReqSkillIndex] = useState<number | null>(null);
  const [editingReqSkillValue, setEditingReqSkillValue] = useState('');

  // Loading Stages
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState<number>(0);

  const ANALYSIS_STAGES = [
    'Reading your information...',
    'Identifying your skills...',
    'Comparing skill requirements...',
    'Finding skill gaps...',
    'Calculating readiness...',
    'Creating your roadmap...',
  ];

  const handleAddInterest = () => {
    if (interestInput.trim() && !areasOfInterest.includes(interestInput.trim())) {
      setAreasOfInterest([...areasOfInterest, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setAreasOfInterest(areasOfInterest.filter((i) => i !== item));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !userSkills.some((s) => s.toLowerCase() === skillInput.trim().toLowerCase())) {
      setUserSkills([...userSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setUserSkills(userSkills.filter((s) => s !== skill));
  };

  const handleAddReqSkill = () => {
    if (reqSkillInput.trim() && !requiredSkills.some((s) => s.toLowerCase() === reqSkillInput.trim().toLowerCase())) {
      setRequiredSkills([...requiredSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleSaveEditedReqSkill = (index: number) => {
    if (editingReqSkillValue.trim()) {
      const updated = [...requiredSkills];
      updated[index] = editingReqSkillValue.trim();
      setRequiredSkills(updated);
      setEditingReqSkillIndex(null);
      setEditingReqSkillValue('');
    }
  };

  const handleSelectRolePreset = (role: string) => {
    setTargetRole(role);
    if (ROLE_REQUIRED_PRESETS[role]) {
      setRequiredSkills(ROLE_REQUIRED_PRESETS[role]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      showToast('Please upload a PDF, DOC, or DOCX file.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size is too large. Please upload a file under 15MB.', 'error');
      return;
    }

    setIsExtractingResume(true);
    try {
      let base64 = '';
      if (fileNameLower.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
      } else {
        const text = await file.text();
        base64 = text;
      }

      const extracted = await extractResumeAPI({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileContent: fileNameLower.endsWith('.pdf') ? base64 : undefined,
        rawText: !fileNameLower.endsWith('.pdf') ? base64 : undefined,
      });

      setUploadedResume(extracted);
      setEditedResumeSkills(extracted.skills.join(', '));
      Storage.saveResume(extracted);

      if (extracted.skills && extracted.skills.length > 0) {
        const merged = [...userSkills];
        extracted.skills.forEach((sk) => {
          if (!merged.some((m) => m.toLowerCase() === sk.toLowerCase())) {
            merged.push(sk);
          }
        });
        setUserSkills(merged);
      }

      showToast(`Resume "${file.name}" uploaded and extracted successfully!`, 'success');
    } catch {
      showToast("We couldn't read this file. Please upload a valid document or paste text.", 'error');
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handlePasteResumeSubmit = async () => {
    if (!resumeTextPasted.trim()) {
      showToast('Please paste your resume text.', 'error');
      return;
    }
    setIsExtractingResume(true);
    try {
      const extracted = await extractResumeAPI({
        fileName: 'Pasted_Resume_Text.txt',
        fileType: 'text/plain',
        rawText: resumeTextPasted,
      });

      setUploadedResume(extracted);
      setEditedResumeSkills(extracted.skills.join(', '));
      Storage.saveResume(extracted);

      if (extracted.skills && extracted.skills.length > 0) {
        const merged = [...userSkills];
        extracted.skills.forEach((sk) => {
          if (!merged.some((m) => m.toLowerCase() === sk.toLowerCase())) {
            merged.push(sk);
          }
        });
        setUserSkills(merged);
      }

      setShowPasteFallback(false);
      showToast('Resume text analyzed successfully!', 'success');
    } catch {
      showToast('Unable to parse resume text. Please check your text.', 'error');
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleSaveEditedResumeSkills = () => {
    if (!uploadedResume) return;
    const newSkills = editedResumeSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = {
      ...uploadedResume,
      skills: newSkills,
    };
    setUploadedResume(updated);
    Storage.saveResume(updated);

    const merged = [...userSkills];
    newSkills.forEach((sk) => {
      if (!merged.some((m) => m.toLowerCase() === sk.toLowerCase())) {
        merged.push(sk);
      }
    });
    setUserSkills(merged);

    setIsEditingResumeInsights(false);
    showToast('Resume skills updated!', 'success');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!targetRole.trim()) {
        showToast('Please enter your target job role.', 'error');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (userSkills.length === 0 && !uploadedResume) {
        showToast('Please provide your skills or upload a resume.', 'error');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleStartAnalysis = async () => {
    if (!targetRole.trim()) {
      showToast('Please enter your target job role.', 'error');
      setCurrentStep(2);
      return;
    }

    if (userSkills.length === 0 && (!uploadedResume || (uploadedResume.skills || []).length === 0)) {
      showToast('Please provide your skills or upload a resume.', 'error');
      setCurrentStep(3);
      return;
    }

    if (requiredSkills.length === 0) {
      showToast('Please enter at least one required skill.', 'error');
      return;
    }

    const profile: UserProfile = {
      id: initialProfile?.id || 'usr_' + Date.now(),
      fullName,
      email,
      educationLevel,
      currentField,
      areasOfInterest,
      targetRole,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    Storage.saveProfile(profile);

    setIsAnalyzing(true);
    setAnalysisStageIndex(0);

    const stageTimer = setInterval(() => {
      setAnalysisStageIndex((prev) => {
        if (prev < ANALYSIS_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    try {
      const result = await analyzeSkillsAPI({
        userProfile: profile,
        targetRole,
        userSkills,
        resumeData: uploadedResume,
        requiredSkills,
      });

      clearInterval(stageTimer);
      setAnalysisStageIndex(ANALYSIS_STAGES.length - 1);

      setTimeout(() => {
        setIsAnalyzing(false);
        Storage.setActiveAnalysis(result);
        showToast('Skill analysis complete!', 'success');
        onAnalysisComplete(result);
      }, 600);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsAnalyzing(false);
      showToast(err.message || 'Analysis failed. Please try again.', 'error');
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center bg-[#080a10]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Analyzing Your Career Profile
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Grounded exclusively on your verified inputs.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {ANALYSIS_STAGES.map((stage, idx) => {
              const isPast = idx < analysisStageIndex;
              const isCurrent = idx === analysisStageIndex;
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                    isPast
                      ? 'text-emerald-400 font-bold'
                      : isCurrent
                      ? 'text-cyan-300 font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            Evaluating {userSkills.length} user skills against {requiredSkills.length} requirements for {targetRole}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14 bg-[#080a10]">
      {/* Colorful Step Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            Step {currentStep} of 5
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Career Goal'}
            {currentStep === 3 && 'Current Skills'}
            {currentStep === 4 && 'Resume Document'}
            {currentStep === 5 && 'Required Role Skills'}
          </div>
        </div>

        {/* Radiant Rainbow Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-500 rounded-full shadow-md shadow-pink-500/30"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Tell Us About Yourself */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Tell Us About Yourself
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Provide your background to personalize your skill gap analysis.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Full Name <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-sm shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-sm shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
                >
                  <option value="High School">High School</option>
                  <option value="Bachelor of Technology / BS">Bachelor of Technology / BS</option>
                  <option value="Master of Science / MS">Master of Science / MS</option>
                  <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
                  <option value="PhD / Doctorate">PhD / Doctorate</option>
                  <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Current Course / Field
                </label>
                <input
                  type="text"
                  value={currentField}
                  onChange={(e) => setCurrentField(e.target.value)}
                  placeholder="e.g. Computer Science, Information Systems"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
                />
              </div>
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Areas of Interest
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  placeholder="Type an interest (e.g. Cloud Computing)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {areasOfInterest.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-cyan-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <span>Continue to Career Goal</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Your Career Goal */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Choose Your Career Goal
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Specify your target job role. All gap analysis will calibrate against this role.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Job Role <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Data Analyst, Cloud Architect"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-300 mb-2">
                Popular Target Roles (Click to select preset requirements)
              </span>
              <div className="flex flex-wrap gap-2.5">
                {COMMON_ROLES.map((role) => {
                  const isSelected = targetRole.toLowerCase() === role.toLowerCase();
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleSelectRolePreset(role)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border-cyan-400 text-white shadow-md shadow-indigo-500/25'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <span>Continue to Add Skills</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Add Your Skills Manually */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Add Your Skills
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              List the skills, tools, and technologies you currently know.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Enter skill (e.g. Python, SQL, Excel) and press Add"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-300 mb-2">
                Your Current Skills ({userSkills.length})
              </span>
              {userSkills.length === 0 ? (
                <div className="p-4 text-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                  No skills added yet. Type above or upload your resume in the next step.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-950/70 text-indigo-200 border border-indigo-500/40 shadow-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <span>Continue to Resume Upload</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Upload Your Resume */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Upload Your Resume
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Supported formats: PDF, DOC, DOCX, TXT. We extract readable skills, projects, and education directly to establish verified evidence.
            </p>
          </div>

          {/* Dropzone with Glowing Border */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-500/40 hover:border-cyan-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-950/60 shadow-inner group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            {isExtractingResume ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-sm font-bold text-white">
                  Reading document and identifying present skills...
                </span>
                <span className="text-xs text-slate-400">Extracting verified sections without synthetic fabrication</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">
                    Click to browse or drag & drop your resume
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, DOC, DOCX up to 15MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPasteFallback(!showPasteFallback)}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              {showPasteFallback ? 'Hide text paste box' : 'Or paste resume plain text directly'}
            </button>
          </div>

          {showPasteFallback && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Paste Resume Text
              </label>
              <textarea
                rows={5}
                value={resumeTextPasted}
                onChange={(e) => setResumeTextPasted(e.target.value)}
                placeholder="Paste the text content of your resume here..."
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handlePasteResumeSubmit}
                disabled={isExtractingResume}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Extract from Text
              </button>
            </div>
          )}

          {/* RESUME INSIGHTS with Emerald Accent */}
          {uploadedResume && (
            <div className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-950 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Resume Insights Detected</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({uploadedResume.fileName})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingResumeInsights(!isEditingResumeInsights)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Information</span>
                </button>
              </div>

              {isEditingResumeInsights ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Edit Extracted Skills (comma separated):
                  </label>
                  <textarea
                    rows={3}
                    value={editedResumeSkills}
                    onChange={(e) => setEditedResumeSkills(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEditedResumeSkills}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingResumeInsights(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-emerald-300">Skills detected:</span>{' '}
                    {uploadedResume.skills.length > 0 ? (
                      uploadedResume.skills.join(', ')
                    ) : (
                      <span className="italic text-slate-500">None detected</span>
                    )}
                  </div>

                  {uploadedResume.projects.length > 0 && (
                    <div>
                      <span className="font-bold text-emerald-300">Projects detected:</span>{' '}
                      {uploadedResume.projects.map((p) => p.name).join(', ')}
                    </div>
                  )}

                  {uploadedResume.education.length > 0 && (
                    <div>
                      <span className="font-bold text-emerald-300">Education detected:</span>{' '}
                      {uploadedResume.education.map((e) => e.degree).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <span>Continue to Required Skills</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Define Required Skills */}
      {currentStep === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Define Required Skills for {targetRole}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              The user enters the skills required for the target role. You can add, remove, and edit any skill to match your specific job description.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReqSkill())}
                placeholder="Enter required skill (e.g. SQL, Tableau, Power BI)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Required Skills ({requiredSkills.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    if (ROLE_REQUIRED_PRESETS[targetRole]) {
                      setRequiredSkills(ROLE_REQUIRED_PRESETS[targetRole]);
                    }
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  Reset to role defaults
                </button>
              </div>

              {requiredSkills.length === 0 ? (
                <div className="p-4 text-center rounded-xl border border-dashed border-rose-500/50 text-xs text-rose-400">
                  Please enter at least one required skill to run the analysis.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {requiredSkills.map((reqSkill, idx) => {
                    const isEditing = editingReqSkillIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950 text-sm shadow-xs"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editingReqSkillValue}
                              onChange={(e) => setEditingReqSkillValue(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditedReqSkill(idx)}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-md"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReqSkillIndex(null)}
                              className="px-2.5 py-1 text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-white">{reqSkill}</span>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReqSkillIndex(idx);
                                  setEditingReqSkillValue(reqSkill);
                                }}
                                className="p-1 hover:text-cyan-300"
                                title="Edit skill"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveReqSkill(reqSkill)}
                                className="p-1 hover:text-rose-400"
                                title="Remove skill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Your readiness score will be calculated strictly by comparing your {userSkills.length} provided skills with these {requiredSkills.length} required competencies. No external assumptions applied.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStartAnalysis}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-xl shadow-purple-600/40 cursor-pointer transform hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Skill Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
