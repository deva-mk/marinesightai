import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Shield,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { marineStorage } from '../../services/storage';
import { cryptoVault } from '../../services/cryptoVault';
import { UserProfile, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => marineStorage.getRegisteredUsers());
  const [maskPII, setMaskPII] = useState<boolean>(true);
  const currentUser = marineStorage.getCurrentUser();

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2A2A2A] text-white uppercase">
              Access Control (RBAC)
            </span>
            <span className="text-xs text-[#736B5E]">Role Assignments & Permissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            User & Team Management
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Manage organization members, assign operational roles, and enforce security policies.
          </p>
        </div>

        {/* Zero-Knowledge Privacy Masking Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMaskPII(!maskPII)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              maskPII
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {maskPII ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span>{maskPII ? 'Zero-Knowledge PII Masking: ACTIVE' : 'PII Revealed (Admin View)'}</span>
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] flex items-center justify-between text-xs text-[#5C5449]">
        <div className="flex items-center gap-2 font-bold text-[#2A2A2A]">
          <ShieldCheck className="w-4 h-4 text-[#4F6F52]" />
          <span>Encrypted Identity Vault: Passwords stored as SHA-256 salted hashes.</span>
        </div>
        <span className="text-[11px] font-mono text-[#736B5E]">
          {users.length} Active Operators Enrolled
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#736B5E] uppercase text-[10px] font-extrabold border-b border-[#E8E1D5]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Privacy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const displayName = maskPII && !isCurrent ? cryptoVault.maskName(u.name) : u.name;
                const displayEmail = maskPII && !isCurrent ? cryptoVault.maskEmail(u.email) : u.email;

                return (
                  <tr key={u.id} className="hover:bg-[#F9F6F0]/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-[#E8E1D5]" />
                        <span className="font-bold text-[#2A2A2A]">{displayName}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF6F59]/10 text-[#FF6F59]">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C5449] font-mono">{displayEmail}</td>
                    <td className="py-3.5 px-4 text-[#5C5449]">{u.organization}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:outline-none cursor-pointer"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MARINE_OPERATOR">MARINE_OPERATOR</option>
                        <option value="RESEARCHER">RESEARCHER</option>
                        <option value="CLEANUP_TEAM">CLEANUP_TEAM</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#4F6F52]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {maskPII && !isCurrent ? 'Encrypted & Masked' : 'Clearance Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
