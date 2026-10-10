import React from 'react';
import {
  CalendarCheck2,
  Users,
  BookOpen,
  AlertTriangle,
  Database,
  FileText,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Presentation,
} from 'lucide-react';

import { User, UserRole } from '../types';

export type { UserRole };
export type ActiveTab = 'mark' | 'analytics' | 'students' | 'subjects' | 'mern' | 'report' | 'ppt';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  defaultersCount: number;
  currentUser: User;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  defaultersCount,
  currentUser,
  onOpenAuthModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding, role picker & quick status */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  SmartAttend
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded">
                  MERN STACK
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Student Attendance & Report System
              </p>
            </div>
          </div>

          {/* Role switcher & quick metadata */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-400 px-2 hidden md:inline text-[11px] font-medium uppercase tracking-wider">
                Active Role:
              </span>
              <button
                type="button"
                onClick={() => setUserRole('faculty')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  userRole === 'faculty'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  userRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  userRole === 'student'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>

            {/* Current user badge & RBAC sign-in modal trigger */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs text-left"
              title="Click to view RBAC permissions matrix or switch user"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="font-bold text-white text-[11px] truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  {currentUser.role}
                </div>
              </div>
              <span className="text-[10px] text-blue-400 font-medium px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 hidden sm:inline">
                RBAC
              </span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mark'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Reports & Defaulters</span>
            {defaultersCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                {defaultersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'students'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students (CRUD)</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'subjects'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects & Curriculum</span>
          </button>

          <button
            onClick={() => setActiveTab('mern')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mern'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>MERN Stack & Mongo Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-900/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Final Project Report (8 Sections)</span>
          </button>

          <button
            onClick={() => setActiveTab('ppt')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'ppt'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-blue-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/60'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-300" />
            <span>Presentation (PPT & Downloads)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
