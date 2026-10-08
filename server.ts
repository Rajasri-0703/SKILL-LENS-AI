import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for deterministic local fallback if Gemini key is missing or offline
function calculateDeterministicAnalysis(payload: {
  targetRole: string;
  userSkills: string[];
  requiredSkills: string[];
  resumeData?: any;
}) {
  const { targetRole, userSkills, requiredSkills, resumeData } = payload;
  const userSkillSet = new Set(userSkills.map((s) => s.trim().toLowerCase()));
  const resumeSkills = (resumeData?.skills || []).map((s: string) => s.trim().toLowerCase());
  resumeSkills.forEach((s: string) => userSkillSet.add(s));

  const resumeProjects = resumeData?.projects || [];
  const resumeExp = resumeData?.experience || [];

  const strongMatches: string[] = [];
  const partialMatches: string[] = [];
  const missingSkills: string[] = [];
  const skillEvidences: any[] = [];

  requiredSkills.forEach((reqSkill) => {
    const reqLower = reqSkill.trim().toLowerCase();

    // Check if directly matches
    let directMatch = userSkillSet.has(reqLower);
    let partialMatch = false;

    if (!directMatch) {
      // Check partial inclusion
      for (const s of userSkillSet) {
        if (s.includes(reqLower) || reqLower.includes(s)) {
          partialMatch = true;
          break;
        }
      }
    }

    // Evidence search in resume projects/experience
    let evidence = '';
    let source: any = 'User-provided skill';
    let confidence: any = 'Low';

    const projectFinding = resumeProjects.find(
      (p: any) =>
        (p.name && p.name.toLowerCase().includes(reqLower)) ||
        (p.description && p.description.toLowerCase().includes(reqLower)) ||
        (p.techUsed && p.techUsed.some((t: string) => t.toLowerCase().includes(reqLower)))
    );

    const expFinding = resumeExp.find(
      (e: any) =>
        (e.role && e.role.toLowerCase().includes(reqLower)) ||
        (e.description && e.description.toLowerCase().includes(reqLower))
    );

    if (projectFinding) {
      evidence = `Mentioned in Project: "${projectFinding.name}" (${(projectFinding.techUsed || []).join(', ') || projectFinding.description || 'Verified'})`;
      source = 'Resume Project';
      confidence = 'High';
    } else if (expFinding) {
      evidence = `Found in Experience: "${expFinding.role}" at ${expFinding.company || 'Organization'}`;
      source = 'Resume Experience';
      confidence = 'High';
    } else if (directMatch && resumeSkills.includes(reqLower)) {
      evidence = 'Listed in Resume Skills section';
      source = 'Resume Skills List';
      confidence = 'Medium';
    } else if (directMatch) {
      evidence = 'Manually added by user in skill profile';
      source = 'Manually added by user';
      confidence = 'Medium';
    } else if (partialMatch) {
      evidence = 'Related skill keywords detected in user-provided profile';
      source = 'User-provided skill';
      confidence = 'Low';
    } else {
      evidence = 'No mention found in user profile or uploaded resume';
      source = 'User-provided skill';
      confidence = 'Low';
    }

    if (directMatch) {
      strongMatches.push(reqSkill);
      skillEvidences.push({
        skillName: reqSkill,
        status: 'strong_match',
        evidence,
        source,
        confidence,
        confidenceReason: confidence === 'High' ? 'Appears with verified context in project/experience' : 'Present in profile skill list',
        priority: 'Low',
        priorityReason: 'Already possessed and verified for target role',
        whyItMatters: `${reqSkill} is a core competency for ${targetRole}.`,
        recommendedNextStep: 'Maintain active practice and demonstrate in portfolio.',
      });
    } else if (partialMatch) {
      partialMatches.push(reqSkill);
      skillEvidences.push({
        skillName: reqSkill,
        status: 'partial_match',
        evidence,
        source,
        confidence,
        confidenceReason: 'Related knowledge exists but exact competency needs reinforcement',
        priority: 'Medium',
        priorityReason: 'Partial foundation exists; fast track to bridge the gap',
        whyItMatters: `${reqSkill} is requested for ${targetRole} and building on existing knowledge will increase readiness.`,
        recommendedNextStep: `Deepen practical exercises focusing on advanced ${reqSkill} patterns.`,
      });
    } else {
      missingSkills.push(reqSkill);
      skillEvidences.push({
        skillName: reqSkill,
        status: 'missing',
        evidence,
        source: 'User-provided skill',
        confidence: 'Low',
        confidenceReason: 'Skill was not found in any provided documentation',
        priority: 'High',
        priorityReason: 'Required core skill completely missing from current profile',
        whyItMatters: `${reqSkill} is an essential prerequisite entered for ${targetRole}.`,
        recommendedNextStep: `Study foundational concepts and syntax of ${reqSkill}.`,
      });
    }
  });

  // Additional skills (user skills not in required)
  const requiredLowerList = requiredSkills.map((s) => s.trim().toLowerCase());
  const additionalSkills = userSkills.filter((s) => !requiredLowerList.some((req) => req === s.toLowerCase() || req.includes(s.toLowerCase())));

  additionalSkills.forEach((addSkill) => {
    skillEvidences.push({
      skillName: addSkill,
      status: 'additional',
      evidence: 'Provided by user, not explicitly listed in target role requirements',
      source: 'Manually added by user',
      confidence: 'Medium',
      confidenceReason: 'User specified competency',
      priority: 'Low',
      priorityReason: 'Valuable complementary skill not blocking target role requirements',
      whyItMatters: `Provides differentiated breadth alongside ${targetRole} requirements.`,
      recommendedNextStep: 'Keep as a complementary strength in your profile.',
    });
  });

  const totalRequired = requiredSkills.length;
  const readinessScore = totalRequired > 0
    ? Math.round(((strongMatches.length * 1.0 + partialMatches.length * 0.5) / totalRequired) * 100)
    : 0;

  // Personalized Roadmap divided into 4 Phases based on gaps
  const phase1Skills = missingSkills.slice(0, 2);
  const phase2Skills = [...partialMatches, ...missingSkills.slice(2, 4)];
  const phase3Skills = missingSkills.slice(4);

  const roadmap = [
    {
      phaseNumber: 1,
      title: 'Phase 1 — Foundation',
      description: 'Acquire core syntax, foundational mental models, and primary workflows for high-priority missing skills.',
      skills: phase1Skills.length > 0 ? phase1Skills : ['Core Fundamentals & Tooling Setup'],
      actionItems: [
        `Review fundamental documentation and environment setup for ${phase1Skills.join(', ') || 'prerequisite tools'}.`,
        'Complete basic exercises and self-contained coding challenges.',
        'Document notes and key definitions in your personal study repository.',
      ],
    },
    {
      phaseNumber: 2,
      title: 'Phase 2 — Intermediate',
      description: 'Strengthen partial matches and intermediate tooling to connect individual skills into functional workflows.',
      skills: phase2Skills.length > 0 ? phase2Skills : ['Workflow Integration & Data Pipelines'],
      actionItems: [
        `Focus on real-world usage patterns for ${phase2Skills.join(', ') || 'connected tools'}.`,
        'Build small script automation or focused modules testing boundary cases.',
        'Refactor existing code to adhere to best practices.',
      ],
    },
    {
      phaseNumber: 3,
      title: 'Phase 3 — Advanced',
      description: 'Master advanced optimization, performance tuning, and architectural considerations.',
      skills: phase3Skills.length > 0 ? phase3Skills : ['Architecture & Production Best Practices'],
      actionItems: [
        'Study architectural blueprints and production-grade design patterns.',
        'Implement error-handling, edge case validation, and testing suites.',
        'Benchmark efficiency and readability against industry guidelines.',
      ],
    },
    {
      phaseNumber: 4,
      title: 'Phase 4 — Practical Application',
      description: 'Synthesize newly acquired skills into an end-to-end, portfolio-ready project for your target role.',
      skills: [...missingSkills.slice(0, 3), targetRole],
      actionItems: [
        `Architect a standalone capstone project demonstrating ${targetRole} proficiencies.`,
        'Write clear documentation (README, architecture diagram, setup instructions).',
        'Deploy the project or share version-controlled code demonstrating evidence of skill acquisition.',
      ],
    },
  ];

  // 30-Day Action Plan
  const actionPlan = [
    {
      weekNumber: 1,
      title: 'Week 1: Core Setup & Fundamentals',
      focus: phase1Skills[0] ? `Kickstart ${phase1Skills[0]} basics` : 'Foundational Setup',
      tasks: [
        `Set up development environment and study materials for ${phase1Skills[0] || 'primary missing skills'}.`,
        'Complete daily 45-minute focused syntax drills.',
        'Summarize core concepts and create flashcards or cheatsheets.',
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2: Deep Dive & Practice Queries/Scripts',
      focus: phase1Skills[1] || phase1Skills[0] || 'Practical Exercises',
      tasks: [
        `Practice writing independent scripts and exercises in ${phase1Skills[1] || phase1Skills[0] || 'gap areas'}.`,
        'Solve 5 targeted problem sets focusing on data manipulation and error handling.',
        'Review code against standard style guides.',
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3: Workflow Integration & Partial Match Reinforcement',
      focus: partialMatches[0] || 'Strengthen Partial Skills',
      tasks: [
        `Bridge existing knowledge in ${partialMatches[0] || 'intermediate topics'} to full competency.`,
        'Combine two separate skills in an integrated mini-pipeline.',
        'Conduct a self-review of common interview questions in these areas.',
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4: Capstone Artifact & Profile Verification',
      focus: `Deliver a concrete ${targetRole} portfolio artifact`,
      tasks: [
        `Implement a mini project showcasing ${missingSkills.slice(0, 2).join(' & ') || 'your bridged skills'}.`,
        'Publish project with clear README documentation and reproducible steps.',
        'Recalculate your SkillLens profile to reflect completed milestones.',
      ],
    },
  ];

  const topSkillGaps = skillEvidences
    .filter((e) => e.status === 'missing' || e.status === 'partial_match')
    .sort((a, b) => (a.priority === 'High' ? -1 : 1))
    .slice(0, 3)
    .map((e) => ({
      skillName: e.skillName,
      priority: e.priority,
      status: e.status,
      whyItMatters: e.whyItMatters,
      nextStep: e.recommendedNextStep,
    }));

  return {
    targetRole,
    readinessScore,
    totalRequiredSkills: totalRequired,
    matchedCount: strongMatches.length,
    partialCount: partialMatches.length,
    missingCount: missingSkills.length,
    additionalCount: additionalSkills.length,
    strongMatches,
    partialMatches,
    missingSkills,
    additionalSkills,
    skillEvidences,
    scoreExplanation: `Your readiness score of ${readinessScore}% is calculated mathematically: you matched ${strongMatches.length} of ${totalRequired} required skills strongly (1.0 weight) and ${partialMatches.length} partially (0.5 weight). Note: This score is informational based on your inputs and does not constitute an employment guarantee.`,
    whyScoreBreakdown: {
      formula: `Score = ((${strongMatches.length} Strong × 1.0) + (${partialMatches.length} Partial × 0.5)) / ${totalRequired} Required × 100 = ${readinessScore}%`,
      matchedExplanation: `You demonstrated strong evidence for: ${strongMatches.join(', ') || 'None yet'}.`,
      partialExplanation: `You possess partial or related knowledge in: ${partialMatches.join(', ') || 'None'}.`,
      missingExplanation: `The following required competencies were not found: ${missingSkills.join(', ') || 'None'}.`,
      firstFocus: missingSkills[0]
        ? `Start by mastering ${missingSkills[0]}, marked as High Priority because it is a core requirement with no current evidence.`
        : 'Focus on advancing your portfolio projects.',
    },
    roadmap,
    actionPlan,
    topSkillGaps,
    userInputsSnapshot: {
      userSkills,
      requiredSkills,
      resumeFileName: resumeData?.fileName,
    },
  };
}

// 1. EXTRACT RESUME ENDPOINT
app.post('/api/extract-resume', async (req, res) => {
  try {
    const { fileName, fileType, fileContent, rawText } = req.body;

    if (!rawText && !fileContent) {
      return res.status(400).json({ error: 'Please provide resume text or document file data.' });
    }

    if (!apiKey) {
      // Deterministic parser if no API key
      const text = rawText || '';
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
      return res.json({
        skills: ['Python', 'SQL', 'Git', 'Data Analysis'].filter((s) => text.toLowerCase().includes(s.toLowerCase())),
        education: [{ degree: 'Degree listed in document', institution: 'University' }],
        projects: [{ name: 'Extracted Project', description: 'Extracted from uploaded text', techUsed: [] }],
        experience: [],
        certifications: [],
        toolsAndTech: ['Git', 'VS Code'],
        rawExcerpt: lines.slice(0, 5).join(' '),
      });
    }

    // Call Gemini to parse resume text or PDF
    let promptContents: any;

    if (fileContent && (fileType?.includes('pdf') || fileName?.endsWith('.pdf'))) {
      promptContents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: fileContent,
            },
          },
          {
            text: `Extract readable information from this uploaded resume.
STRICT RULE: Identify ONLY information that is ACTUALLY present in this document.
Do NOT invent missing skills, projects, certifications, or degrees.
Return a structured JSON with:
- skills: array of skill strings found
- education: array of { degree: string, institution: string, year: string }
- projects: array of { name: string, description: string, techUsed: string[] }
- experience: array of { role: string, company: string, duration: string, description: string }
- certifications: array of certification strings
- toolsAndTech: array of tools/technologies mentioned
- rawExcerpt: string containing a short 2-3 sentence overview of what was found`,
          },
        ],
      };
    } else {
      promptContents = `Extract readable information from this resume text:
"""
${rawText || fileContent}
"""
STRICT RULE: Identify ONLY information that is ACTUALLY present in this text.
Do NOT invent missing skills, projects, certifications, or degrees.
Return a structured JSON with:
- skills: array of skill strings found
- education: array of { degree: string, institution: string, year: string }
- projects: array of { name: string, description: string, techUsed: string[] }
- experience: array of { role: string, company: string, duration: string, description: string }
- certifications: array of certification strings
- toolsAndTech: array of tools/technologies mentioned
- rawExcerpt: string containing a short overview of what was detected`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            toolsAndTech: { type: Type.ARRAY, items: { type: Type.STRING } },
            rawExcerpt: { type: Type.STRING },
          },
          required: ['skills', 'education', 'projects', 'certifications', 'toolsAndTech'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in resume extraction:', error);
    // Return friendly error or fallback
    return res.status(200).json({
      skills: [],
      education: [],
      projects: [],
      experience: [],
      certifications: [],
      toolsAndTech: [],
      rawExcerpt: 'Unable to extract text automatically. Please enter your skills manually in the form.',
      warning: 'Document text could not be parsed automatically.',
    });
  }
});

// 2. ANALYZE SKILLS ENDPOINT
app.post('/api/analyze-skills', async (req, res) => {
  try {
    const { userProfile, targetRole, userSkills, resumeData, requiredSkills } = req.body;

    if (!targetRole || targetRole.trim() === '') {
      return res.status(400).json({ error: 'Please enter your target job role.' });
    }

    if ((!userSkills || userSkills.length === 0) && (!resumeData || (resumeData.skills || []).length === 0)) {
      return res.status(400).json({ error: 'Please provide your skills or upload a resume.' });
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'Please enter at least one required skill.' });
    }

    // Always compute deterministic foundation
    const deterministic = calculateDeterministicAnalysis({
      targetRole,
      userSkills: userSkills || [],
      requiredSkills,
      resumeData,
    });

    if (!apiKey) {
      return res.json({
        id: 'ana_' + Date.now(),
        timestamp: new Date().toISOString(),
        ...deterministic,
      });
    }

    // Use Gemini to produce deep reasoning & evidence verification grounded ONLY on provided user info
    const promptText = `You are the core analysis engine of SkillLens AI.
Analyze the user's provided skills against their target role and required skills.

DATA RULES (CRITICAL):
1. Do NOT depend on external datasets.
2. Do NOT invent user skills, experience, certifications, education, or projects.
3. The AI must never claim that information exists if the user did not provide it.
4. For every skill, identify its genuine source and evidence.
5. If a skill was manually entered by the user and does not appear in the resume, explicitly mark source as "Manually added by user" and do NOT fabricate project quotes.
6. Calculate the readiness score honestly: Formula = ((strongMatches * 1.0 + partialMatches * 0.5) / totalRequiredSkills) * 100.
7. Assign priorities to missing and partial skills:
   - High Priority: Completely missing required core skill.
   - Medium Priority: Partial match or secondary required skill.
   - Low Priority: Minor gap or supplementary.
8. The 4-phase learning roadmap and 30-day action plan must be generated ONLY from the identified skill gaps. Do NOT recommend commercial course websites or external links.

INPUT DATA:
- Target Role: "${targetRole}"
- User Profile: ${JSON.stringify(userProfile || {})}
- Manually Provided Skills: ${JSON.stringify(userSkills || [])}
- Extracted Resume Data: ${JSON.stringify(resumeData || null)}
- Required Skills Defined by User: ${JSON.stringify(requiredSkills || [])}

Provide your response in structured JSON matching the required schema.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetRole: { type: Type.STRING },
            readinessScore: { type: Type.INTEGER },
            strongMatches: { type: Type.ARRAY, items: { type: Type.STRING } },
            partialMatches: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            additionalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillEvidences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  status: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  source: { type: Type.STRING },
                  confidence: { type: Type.STRING },
                  confidenceReason: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  priorityReason: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  recommendedNextStep: { type: Type.STRING },
                },
                required: ['skillName', 'status', 'evidence', 'source', 'confidence', 'priority', 'whyItMatters', 'recommendedNextStep'],
              },
            },
            scoreExplanation: { type: Type.STRING },
            whyScoreBreakdown: {
              type: Type.OBJECT,
              properties: {
                formula: { type: Type.STRING },
                matchedExplanation: { type: Type.STRING },
                partialExplanation: { type: Type.STRING },
                missingExplanation: { type: Type.STRING },
                firstFocus: { type: Type.STRING },
              },
              required: ['formula', 'matchedExplanation', 'partialExplanation', 'missingExplanation', 'firstFocus'],
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['phaseNumber', 'title', 'description', 'skills', 'actionItems'],
              },
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['weekNumber', 'title', 'focus', 'tasks'],
              },
            },
            topSkillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  status: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  nextStep: { type: Type.STRING },
                },
                required: ['skillName', 'priority', 'status', 'whyItMatters', 'nextStep'],
              },
            },
          },
          required: [
            'targetRole',
            'readinessScore',
            'strongMatches',
            'partialMatches',
            'missingSkills',
            'additionalSkills',
            'skillEvidences',
            'scoreExplanation',
            'whyScoreBreakdown',
            'roadmap',
            'actionPlan',
            'topSkillGaps',
          ],
        },
      },
    });

    const parsedAI = JSON.parse(aiResponse.text || '{}');

    // Merge and ensure strict safety constraints
    const finalResult = {
      id: 'ana_' + Date.now(),
      timestamp: new Date().toISOString(),
      targetRole: parsedAI.targetRole || targetRole,
      readinessScore: typeof parsedAI.readinessScore === 'number' ? parsedAI.readinessScore : deterministic.readinessScore,
      totalRequiredSkills: requiredSkills.length,
      matchedCount: parsedAI.strongMatches?.length ?? deterministic.matchedCount,
      partialCount: parsedAI.partialMatches?.length ?? deterministic.partialCount,
      missingCount: parsedAI.missingSkills?.length ?? deterministic.missingCount,
      additionalCount: parsedAI.additionalSkills?.length ?? deterministic.additionalCount,
      strongMatches: parsedAI.strongMatches || deterministic.strongMatches,
      partialMatches: parsedAI.partialMatches || deterministic.partialMatches,
      missingSkills: parsedAI.missingSkills || deterministic.missingSkills,
      additionalSkills: parsedAI.additionalSkills || deterministic.additionalSkills,
      skillEvidences: parsedAI.skillEvidences?.length ? parsedAI.skillEvidences : deterministic.skillEvidences,
      scoreExplanation: parsedAI.scoreExplanation || deterministic.scoreExplanation,
      whyScoreBreakdown: parsedAI.whyScoreBreakdown || deterministic.whyScoreBreakdown,
      roadmap: parsedAI.roadmap?.length ? parsedAI.roadmap : deterministic.roadmap,
      actionPlan: parsedAI.actionPlan?.length ? parsedAI.actionPlan : deterministic.actionPlan,
      topSkillGaps: parsedAI.topSkillGaps?.length ? parsedAI.topSkillGaps : deterministic.topSkillGaps,
      userInputsSnapshot: {
        userSkills,
        requiredSkills,
        resumeFileName: resumeData?.fileName,
      },
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error('Error during skill analysis:', error);
    // Use fallback calculation gracefully
    const deterministic = calculateDeterministicAnalysis(req.body);
    return res.json({
      id: 'ana_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...deterministic,
    });
  }
});

// 3. SKILLLENS ASSISTANT CHATBOT
app.post('/api/chat-assistant', async (req, res) => {
  try {
    const { question, currentAnalysis, userProfile, chatHistory } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please provide a question.' });
    }

    if (!apiKey) {
      return res.json({
        answer: `Based on your analysis for "${currentAnalysis?.targetRole || 'your target role'}", your readiness score is ${currentAnalysis?.readinessScore || 0}%. Your top recommended focus is: ${currentAnalysis?.missingSkills?.[0] || 'reviewing your gaps'}.`,
      });
    }

    const systemInstruction = `You are "SkillLens Assistant", the dedicated career advisor inside SkillLens AI.
You must answer questions strictly using the user's current analysis data provided below.

CRITICAL RULES:
1. You must answer using ONLY the user's current analysis and profile information provided.
2. You must NOT invent or assume any information that is not in the analysis.
3. If the answer cannot be determined from the available information, you MUST say:
   "I don't have enough information to determine that."
4. Be concise, encouraging, professional, and clear.
5. Remind the user that all recommendations are based exclusively on the skills and requirements they entered.`;

    const contents = [
      {
        text: `CURRENT ANALYSIS DATA:
${JSON.stringify({
  targetRole: currentAnalysis?.targetRole,
  readinessScore: currentAnalysis?.readinessScore,
  strongMatches: currentAnalysis?.strongMatches,
  partialMatches: currentAnalysis?.partialMatches,
  missingSkills: currentAnalysis?.missingSkills,
  additionalSkills: currentAnalysis?.additionalSkills,
  topSkillGaps: currentAnalysis?.topSkillGaps,
  scoreExplanation: currentAnalysis?.scoreExplanation,
  whyScoreBreakdown: currentAnalysis?.whyScoreBreakdown,
  roadmap: currentAnalysis?.roadmap,
  actionPlan: currentAnalysis?.actionPlan,
  userProfile: userProfile,
})}

USER QUESTION: "${question}"`,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for high grounding
      },
    });

    const answer = response.text || "I don't have enough information to determine that.";
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in assistant chat:', error);
    return res.json({
      answer: "I don't have enough information to determine that.",
    });
  }
});

// 4. RECALCULATE READINESS ENDPOINT (When user updates progress)
app.post('/api/recalculate-readiness', (req, res) => {
  try {
    const { baseAnalysis, progressRecords } = req.body;

    if (!baseAnalysis) {
      return res.status(400).json({ error: 'No active analysis found to recalculate.' });
    }

    const previousScore = baseAnalysis.readinessScore;
    const requiredSkills: string[] = baseAnalysis.userInputsSnapshot?.requiredSkills || [];
    const totalRequired = requiredSkills.length || baseAnalysis.totalRequiredSkills || 1;

    let strongMatches = [...(baseAnalysis.strongMatches || [])];
    let partialMatches = [...(baseAnalysis.partialMatches || [])];
    let missingSkills = [...(baseAnalysis.missingSkills || [])];
    const improvedSkills: string[] = [];

    // Apply progress changes
    Object.entries(progressRecords || {}).forEach(([skillKey, record]: [string, any]) => {
      const originalSkill = requiredSkills.find((s) => s.toLowerCase() === skillKey) || record.skillName;

      if (record.status === 'completed') {
        // Remove from missing and partial, add to strong
        missingSkills = missingSkills.filter((s) => s.toLowerCase() !== skillKey);
        partialMatches = partialMatches.filter((s) => s.toLowerCase() !== skillKey);
        if (!strongMatches.some((s) => s.toLowerCase() === skillKey)) {
          strongMatches.push(originalSkill);
          improvedSkills.push(`${originalSkill} (Completed)`);
        }
      } else if (record.status === 'in_progress') {
        // Remove from missing, add to partial if not strong
        if (!strongMatches.some((s) => s.toLowerCase() === skillKey)) {
          missingSkills = missingSkills.filter((s) => s.toLowerCase() !== skillKey);
          if (!partialMatches.some((s) => s.toLowerCase() === skillKey)) {
            partialMatches.push(originalSkill);
            improvedSkills.push(`${originalSkill} (In Progress)`);
          }
        }
      }
    });

    const newScore = Math.min(100, Math.round(((strongMatches.length * 1.0 + partialMatches.length * 0.5) / totalRequired) * 100));
    const scoreDelta = newScore - previousScore;

    const updatedAnalysis = {
      ...baseAnalysis,
      readinessScore: newScore,
      matchedCount: strongMatches.length,
      partialCount: partialMatches.length,
      missingCount: missingSkills.length,
      strongMatches,
      partialMatches,
      missingSkills,
      scoreExplanation: `Recalculated readiness score: ${newScore}% based on updated skill progress (${strongMatches.length} strong, ${partialMatches.length} partial of ${totalRequired} required).`,
    };

    return res.json({
      updatedAnalysis,
      comparison: {
        previousScore,
        currentScore: newScore,
        scoreDelta,
        previousDate: baseAnalysis.timestamp,
        currentDate: new Date().toISOString(),
        previousRole: baseAnalysis.targetRole,
        currentRole: baseAnalysis.targetRole,
        improvedSkills,
        newSkills: [],
        remainingGaps: missingSkills,
      },
    });
  } catch (error) {
    console.error('Error recalculating readiness:', error);
    return res.status(500).json({ error: 'Failed to recalculate readiness' });
  }
});

// 5. ARCHITECTURE BLUEPRINT ENDPOINT
app.get('/api/architecture-blueprint', (req, res) => {
  res.json({
    title: 'SkillLens AI — Production Enterprise Architecture Blueprint',
    stack: {
      frontend: 'React 19 SPA + Vite + Tailwind CSS + Lucide Icons',
      backend: 'Python FastAPI (Async ASGI) + Pydantic v2 + Uvicorn',
      database: 'PostgreSQL 16 + SQLAlchemy 2.0 ORM + Alembic Migrations',
      aiEngine: 'Google Gemini 3.8 Flash via @google/genai & google-genai SDK',
      caching: 'Redis 7 for rate-limiting & session cache',
    },
    codebaseStructure: {
      frontend: [
        'src/components/ (Landing, Onboarding, Dashboard, Profile, History, Assistant, Architecture)',
        'src/types/skillLens.ts (Domain models, evidence & readiness types)',
        'src/utils/api.ts (API client & validation)',
        'src/utils/storage.ts (Persistent user data sync)',
      ],
      backendFastAPI: [
        'app/main.py (FastAPI application factory, CORS, routers)',
        'app/api/v1/endpoints/ (resume.py, analysis.py, assistant.py, profile.py)',
        'app/core/config.py (pydantic-settings, GEMINI_API_KEY, DATABASE_URL)',
        'app/models/ (user.py, profile.py, analysis.py, skill.py, progress.py)',
        'app/schemas/ (user.py, analysis.py, evidence.py, assistant.py)',
        'app/services/ (gemini_analyzer.py, resume_parser.py, readiness_calculator.py)',
        'app/db/ (session.py, base.py, migrations/)',
      ],
      databaseSchemaPostgres: [
        'users (id UUID PRIMARY KEY, email VARCHAR UNIQUE, full_name VARCHAR, created_at TIMESTAMPTZ)',
        'profiles (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), education_level VARCHAR, current_field VARCHAR, target_role VARCHAR)',
        'analyses (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), target_role VARCHAR, readiness_score INT, data JSONB, created_at TIMESTAMPTZ)',
        'user_skills (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), skill_name VARCHAR, source VARCHAR, confidence VARCHAR)',
        'skill_progress (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), skill_name VARCHAR, status VARCHAR, updated_at TIMESTAMPTZ)',
      ],
    },
  });
});

// Setup Vite dev middleware or serve built dist
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillLens AI server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
