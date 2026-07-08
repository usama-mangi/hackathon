"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Copy, 
  Check, 
  User, 
  Mail, 
  Shield 
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  hackathonId: string;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
  leader: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    members: number;
  };
}

interface TeamsClientProps {
  hackathon: any;
  initialTeams: Team[];
}

export default function TeamsClient({ hackathon, initialTeams }: TeamsClientProps) {
  const [teams] = useState<Team[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.inviteCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, t) => sum + (t._count?.members || 0), 0);

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            Registered Teams
          </h1>
          <p className="text-xs text-on-surface-variant">
            Manage and view team formations for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Teams</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalTeams}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Team Members</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalMembers}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/60 pb-3">
        <h2 className="font-display font-bold text-lg text-on-surface self-start sm:self-auto">
          Team List
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Search by name, leader, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-outline"
          />
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No teams found</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                There are no teams matching your search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-xs border-b border-outline-variant">
                  <th className="p-4 pl-6">Team Name</th>
                  <th className="p-4">Invite Code</th>
                  <th className="p-4">Team Leader</th>
                  <th className="p-4 text-center">Members Count</th>
                  <th className="p-4 text-right pr-6">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-on-surface text-sm">{team.name}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="bg-surface px-2.5 py-1 rounded-md border border-outline-variant/70 text-on-surface font-bold text-xs select-all">
                          {team.inviteCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(team.id, team.inviteCode)}
                          className="p-1 rounded hover:bg-surface-container transition-colors text-outline hover:text-on-surface"
                          title="Copy Invite Code"
                        >
                          {copiedId === team.id ? (
                            <Check className="h-3.5 w-3.5 text-status-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-outline" /> {team.leader.name}
                        </span>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Mail className="h-3.5 w-3.5 text-outline" /> {team.leader.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-on-surface">
                      {team._count?.members || 1}
                    </td>
                    <td className="p-4 text-right pr-6 text-xs text-on-surface-variant font-mono">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
