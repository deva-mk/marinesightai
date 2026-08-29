import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Shield
} from 'lucide-react';
import { DEMO_USERS } from '../../data/sampleData';
import { UserProfile, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);

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
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9F6F0]/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-[#E8E1D5]" />
                      <span className="font-bold text-[#2A2A2A]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5C5449] font-mono">{u.email}</td>
                  <td className="py-3.5 px-4 text-[#5C5449]">{u.organization}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:outline-none"
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
