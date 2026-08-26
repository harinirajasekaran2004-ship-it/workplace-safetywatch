import React, { useState } from "react";
import {
  User,
  Shield,
  Building,
  MapPin,
  Mail,
  Bell,
  CheckCircle,
  Sliders,
  LogOut,
  Sparkles,
  Key,
  FileText
} from "lucide-react";
import { User as UserType } from "@/lib/api";

interface ProfileSettingsViewProps {
  user: UserType;
  onLogout: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  onLogout
}) => {
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [highRiskNotify, setHighRiskNotify] = useState<boolean>(true);
  const [autoOshaAudit, setAutoOshaAudit] = useState<boolean>(true);
  const [savedMsg, setSavedMsg] = useState<string>("");

  const handleSaveSettings = () => {
    setSavedMsg("Settings updated successfully.");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const isManager = user.role === "manager";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-white animate-fadeIn">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold ${
              isManager
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {user.name.split(" ").map(n => n[0]).join("") || "U"}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isManager
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {isManager ? "🛡️ Safety Manager" : "👷 Reporter / Employee"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Building className="h-3.5 w-3.5 text-emerald-400" />
              <span>Department</span>
            </span>
            <p className="text-sm font-semibold text-white">
              {user.department || (isManager ? "EHS Compliance Command" : "Facility Operations")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Facility Location</span>
            </span>
            <p className="text-sm font-semibold text-white">
              {user.facility_location || "Main Production Complex"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Safety Permissions</span>
            </span>
            <p className="text-sm font-semibold text-emerald-400">
              {isManager ? "Full Triage & Remediation" : "Hazard Reporting & AI Chat"}
            </p>
          </div>
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
          <Sliders className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Safety Notification & Dispatch Preferences</h2>
        </div>

        {savedMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">Direct Email Dispatch for High-Risk Hazards</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically receive incident escalations at <strong>harinirajasekaran2004@gmail.com</strong>
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="h-5 w-5 rounded-lg border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">Real-time Multi-Agent Pipeline Notifications</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Display live 7-agent progression steps and probability confidence scoring in timeline
              </p>
            </div>
            <input
              type="checkbox"
              checked={highRiskNotify}
              onChange={e => setHighRiskNotify(e.target.checked)}
              className="h-5 w-5 rounded-lg border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">Automatic OSHA Standards & Rule Correlation</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Cross-reference visual hazard findings with curated regulatory compliance mandates
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoOshaAudit}
              onChange={e => setAutoOshaAudit(e.target.checked)}
              className="h-5 w-5 rounded-lg border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
