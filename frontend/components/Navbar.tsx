import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  BookOpen,
  Bot,
  User as UserIcon,
  LogOut,
  LogIn,
  CheckSquare
} from "lucide-react";
import { User } from "@/lib/api";

interface NavbarProps {
  activeTab: "report" | "manager" | "reporter_incidents" | "analytics" | "rules" | "chat" | "profile";
  onTabChange: (tab: "report" | "manager" | "reporter_incidents" | "analytics" | "rules" | "chat" | "profile") => void;
  openIncidentsCount?: number;
  highRiskCount?: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  openIncidentsCount = 0,
  highRiskCount = 0,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const isManager = currentUser?.role === "manager";
  const isReporter = currentUser?.role === "employee";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("report")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Workplace SafetyWatch
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                MULTI-AGENT MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AI Hazard Detection, Incident Management & Safety Copilot
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Report Hazard */}
          <button
            onClick={() => onTabChange("report")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "report"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Report Hazard</span>
          </button>

          {/* Safety Chatbot (for Reporters) */}
          <button
            onClick={() => onTabChange("chat")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
            <span>Safety AI Chat</span>
          </button>

          {/* CONDITIONAL TAB: If Reporter, show "My Complaints"; If Manager, show "Manager Portal" */}
          {isReporter && (
            <button
              onClick={() => onTabChange("reporter_incidents")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "reporter_incidents"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>My Reported Hazards</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={() => onTabChange("manager")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "manager"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Manager Portal</span>
              {openIncidentsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {openIncidentsCount}
                </span>
              )}
            </button>
          )}

          {/* Analytics */}
          <button
            onClick={() => onTabChange("analytics")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics & KPI</span>
          </button>

          {/* Safety Rules */}
          <button
            onClick={() => onTabChange("rules")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "rules"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Safety Rules</span>
          </button>
        </nav>

        {/* User Auth & Profile Actions */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTabChange("profile")}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
                  activeTab === "profile"
                    ? "bg-slate-800 border-emerald-500/50 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                  isManager ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                  {currentUser.name[0]}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-white leading-none">{currentUser.name}</div>
                  <span className={`text-[10px] uppercase font-bold ${isManager ? "text-blue-400" : "text-emerald-400"}`}>
                    {isManager ? "Manager" : "Reporter"}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                title="Sign Out / Switch Account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
