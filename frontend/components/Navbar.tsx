import React from "react";
import { Shield, AlertTriangle, Users, BarChart3, BookOpen } from "lucide-react";

interface NavbarProps {
  activeTab: "employee" | "manager" | "stats" | "rules";
  setActiveTab: (tab: "employee" | "manager" | "stats" | "rules") => void;
  openCount?: number;
  highRiskCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCount = 0,
  highRiskCount = 0,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("employee")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Workplace SafetyWatch</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Multi-Agent MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">AI Hazard Detection & Incident Management</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("employee")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "employee"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Report Hazard</span>
            </button>

            <button
              onClick={() => setActiveTab("manager")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === "manager"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Manager Portal</span>
              {openCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-xs rounded-full">
                  {openCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "stats"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics & KPI</span>
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "rules"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Safety Rules</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
