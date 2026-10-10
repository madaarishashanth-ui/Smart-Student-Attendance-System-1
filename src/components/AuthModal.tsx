import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Lock,
  Mail,
  CheckCircle2,
  X,
  KeyRound,
  Check,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSwitchUser: (role: UserRole, customUser?: Partial<User>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>(currentUser.role);
  const [showMatrix, setShowMatrix] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSwitchUser(selectedDemoRole, {
      email: email || `${selectedDemoRole}@college.edu`,
    });
    onClose();
  };

  const handleQuickLogin = (role: UserRole) => {
    onSwitchUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-400" />
              Role-Based Access Control (RBAC) & Sign-In
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate enterprise authentication and test authorization rules.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Active Badge */}
        <div className="my-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Currently Logged In As:</span>
            <span className="font-bold text-white text-sm">{currentUser.name}</span>
            <span className="text-slate-500 block text-[11px]">{currentUser.email}</span>
          </div>
          <span
            className={`font-mono text-xs font-bold uppercase px-2.5 py-1 rounded border ${
              currentUser.role === 'admin'
                ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                : currentUser.role === 'faculty'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}
          >
            {currentUser.role}
          </span>
        </div>

        {/* 1-Click Role Accounts */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Instant Demo Profiles
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Faculty card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentUser.role === 'faculty'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-blue-400 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>Faculty</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Dr. Rajesh Sen</div>
              <div className="text-[10px] text-slate-400">Class marking & PIN generation</div>
            </button>

            {/* Admin card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin / HOD</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Dr. Ramesh Gupta</div>
              <div className="text-[10px] text-slate-400">Full CRUD & system config</div>
            </button>

            {/* Student card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentUser.role === 'student'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </div>
              <div className="text-[11px] font-semibold text-white">Aarav Sharma</div>
              <div className="text-[10px] text-slate-400">PIN check-in & standing</div>
            </button>
          </div>
        </div>

        {/* Toggle RBAC Matrix button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            {showMatrix ? '▲ Hide Role Permissions Matrix' : '▼ View Role Permissions Matrix (RBAC)'}
          </button>
        </div>

        {/* RBAC Matrix Table */}
        {showMatrix && (
          <div className="mt-3 overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-800 text-[11px]">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2">Capability / Operation</th>
                  <th className="p-2 text-center text-blue-400">Faculty</th>
                  <th className="p-2 text-center text-indigo-400">Admin</th>
                  <th className="p-2 text-center text-emerald-400">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2">Batch Mark Attendance</td>
                  <td className="p-2 text-center text-emerald-400">✔ Yes</td>
                  <td className="p-2 text-center text-emerald-400">✔ Yes</td>
                  <td className="p-2 text-center text-rose-400">✘ No</td>
                </tr>
                <tr>
                  <td className="p-2">Students CRUD (Add/Edit/Delete)</td>
                  <td className="p-2 text-center text-slate-500">View Only</td>
                  <td className="p-2 text-center text-emerald-400">✔ Full</td>
                  <td className="p-2 text-center text-slate-500">View Only</td>
                </tr>
                <tr>
                  <td className="p-2">Curriculum Subjects CRUD</td>
                  <td className="p-2 text-center text-slate-500">View Only</td>
                  <td className="p-2 text-center text-emerald-400">✔ Full</td>
                  <td className="p-2 text-center text-slate-500">View Only</td>
                </tr>
                <tr>
                  <td className="p-2">Student PIN Self Check-In</td>
                  <td className="p-2 text-center text-slate-400">Issues PIN</td>
                  <td className="p-2 text-center text-slate-400">Issues PIN</td>
                  <td className="p-2 text-center text-emerald-400">✔ Redeem</td>
                </tr>
                <tr>
                  <td className="p-2">University Defaulter Cutoff Config</td>
                  <td className="p-2 text-center text-slate-500">Read</td>
                  <td className="p-2 text-center text-emerald-400">✔ Edit</td>
                  <td className="p-2 text-center text-slate-500">Read</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
