import React, { useState } from 'react';
import { X, ShieldCheck, User, Lock, Mail, CheckCircle2, Waves, ArrowRight } from 'lucide-react';
import { DEMO_USERS } from '../../data/sampleData';
import { UserProfile, UserRole } from '../../types';
import { marineStorage } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'email'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('MARINE_OPERATOR');
  const [isRegister, setIsRegister] = useState(false);

  if (!isOpen) return null;

  const handleSelectDemoUser = (user: UserProfile) => {
    marineStorage.setCurrentUser(user);
    onSuccess();
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name || email.split('@')[0] || 'Marine Analyst',
      email: email || 'operator@marinesight.ai',
      role: role,
      organization: 'MarineSight AI Environmental Field Team'
    };
    marineStorage.setCurrentUser(newUser);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#F9F6F0] rounded-3xl shadow-2xl border border-[#E3DBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6F59] text-white flex items-center justify-center shadow-md shadow-[#FF6F59]/30">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2A2A2A]">MarineSight AI Access Portal</h3>
              <p className="text-xs text-[#736B5E]">Secure role-based marine intelligence sign in</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F2EDE4] text-[#5C5449]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#E8E1D5]">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'demo'
                ? 'border-[#FF6F59] text-[#FF6F59]'
                : 'border-transparent text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            Instant Demo Logins (1-Click)
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'email'
                ? 'border-[#FF6F59] text-[#FF6F59]'
                : 'border-transparent text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            {isRegister ? 'Register Account' : 'Email Sign In'}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          
          {activeTab === 'demo' ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#5C5449] mb-3">
                Select a pre-configured role to immediately explore with realistic operational permissions:
              </p>

              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectDemoUser(user)}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#FF6F59] hover:shadow-md text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatarUrl} 
                      alt="" 
                      className="w-9 h-9 rounded-xl object-cover border border-[#E3DBD0]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#FF6F59] transition-colors">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF6F59]/10 text-[#FF6F59]">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#736B5E] truncate max-w-[260px]">
                        {user.organization}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#8C8275] group-hover:text-[#FF6F59] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-[#5C5449] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Commander Sarah Connor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#FF6F59] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5C5449] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@ocean-observatory.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#FF6F59] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5449] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#FF6F59] focus:outline-none"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-[#5C5449] mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#FF6F59] focus:outline-none font-medium"
                  >
                    <option value="MARINE_OPERATOR">Marine Operator (Field & Sonar Upload)</option>
                    <option value="RESEARCHER">Researcher (Data Analysis & Trends)</option>
                    <option value="CLEANUP_TEAM">Cleanup Team (Missions & Removal)</option>
                    <option value="ADMIN">Admin (Full System Access)</option>
                    <option value="VIEWER">Viewer (Public Safe Read Only)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-extrabold shadow-md shadow-[#FF6F59]/30 transition-all"
              >
                {isRegister ? 'Create Account & Access' : 'Sign In with Firebase'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-[#736B5E] hover:text-[#FF6F59] font-medium"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
