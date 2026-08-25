"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { EmployeeReportView } from "@/components/EmployeeReportView";
import { ManagerDashboardView } from "@/components/ManagerDashboardView";
import { StatsOverview } from "@/components/StatsOverview";
import { SafetyRulesView } from "@/components/SafetyRulesView";
import { fetchDashboardStats, DashboardStats } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"employee" | "manager" | "stats" | "rules">("employee");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const refreshStats = () => {
    fetchDashboardStats()
      .then(d => setStats(d))
      .catch(e => console.error("Stats refresh error:", e));
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCount={stats?.open_incidents || 0}
        highRiskCount={stats?.high_risk_incidents || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "employee" && <EmployeeReportView />}
        {activeTab === "manager" && <ManagerDashboardView />}
        {activeTab === "stats" && <StatsOverview />}
        {activeTab === "rules" && <SafetyRulesView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workplace SafetyWatch — Multi-Agent AI Incident Management System</span>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI</span>
            <span>•</span>
            <span>LangGraph (7 Agents)</span>
            <span>•</span>
            <span>Groq Vision/LLM</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
