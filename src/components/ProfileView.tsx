import React, { useState } from 'react';
import { UserProfile, ExtractedResume } from '../types/skillLens';
import { Storage, getDefaultProfile } from '../utils/storage';
import { useToast } from './Toast';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  FileCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  FileText,
  Tag,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

interface ProfileViewProps {
  onReanalyze: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onReanalyze }) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(() => Storage.getProfile() || getDefaultProfile());
  const [resume, setResume] = useState<ExtractedResume | null>(() => Storage.getResume());

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [currentField, setCurrentField] = useState(profile.currentField);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(profile.areasOfInterest || []);
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      fullName,
      email,
      educationLevel,
      currentField,
      targetRole,
      areasOfInterest,
      updatedAt: new Date().toISOString(),
    };
    Storage.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !areasOfInterest.includes(newInterest.trim())) {
      setAreasOfInterest([...areasOfInterest, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setAreasOfInterest(areasOfInterest.filter((i) => i !== item));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#080a10]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-500/20">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            Account & Background
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Profile
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your background information and linked resume evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <span>Edit Profile</span>
            </button>
          )}

          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-purple-600/30 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Details</span>
          </h3>

          {isEditing ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Education Level</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Current Field</label>
                  <input
                    type="text"
                    value={currentField}
                    onChange={(e) => setCurrentField(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Areas of Interest</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add area"
                    className="flex-1 p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-indigo-600 rounded-xl font-bold text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {areasOfInterest.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                    >
                      {interest}
                      <button type="button" onClick={() => handleRemoveInterest(interest)}>
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm divide-y divide-slate-800">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold">Full Name</span>
                <span className="font-extrabold text-white">{profile.fullName || 'Not specified'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold">Email</span>
                <span className="text-cyan-300 font-mono text-xs">{profile.email || 'Not specified'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold">Education Level</span>
                <span className="text-slate-200">{profile.educationLevel}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold">Current Course / Field</span>
                <span className="text-slate-200">{profile.currentField}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold">Target Job Role</span>
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  {profile.targetRole}
                </span>
              </div>

              <div className="pt-3">
                <span className="text-slate-400 text-xs font-bold block mb-2">Areas of Interest</span>
                <div className="flex flex-wrap gap-2">
                  {profile.areasOfInterest && profile.areasOfInterest.length > 0 ? (
                    profile.areasOfInterest.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None entered</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Linked Resume Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Resume Status
            </h3>
          </div>

          {resume ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                <div className="font-bold">{resume.fileName}</div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">
                  Attached and parsed on {new Date(resume.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div>
                  <strong className="text-white">Skills extracted:</strong> {resume.skills.length}
                </div>
                <div>
                  <strong className="text-white">Projects detected:</strong> {resume.projects.length}
                </div>
                <div>
                  <strong className="text-white">Education records:</strong> {resume.education.length}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Detected skills sample:
                </span>
                <p className="text-[11px] text-slate-300">
                  {resume.skills.slice(0, 6).join(', ')}
                  {resume.skills.length > 6 ? '...' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 space-y-3">
              <p>No resume document linked yet.</p>
              <p className="text-[11px]">
                Uploading a resume allows SkillLens AI to substantiate skills with genuine project & experience evidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
