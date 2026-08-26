"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { EmployeeReportView } from "@/components/EmployeeReportView";
import { ReporterIncidentsView } from "@/components/ReporterIncidentsView";
import { ManagerDashboardView } from "@/components/ManagerDashboardView";
import { StatsOverview } from "@/components/StatsOverview";
import { SafetyRulesView } from "@/components/SafetyRulesView";
import { SafetyChatbot } from "@/components/SafetyChatbot";
import { ProfileSettingsView } from "@/components/ProfileSettingsView";
import { AuthModal } from "@/components/AuthModal";
import { fetchDashboardStats, DashboardStats, User } from "@/lib/api";

const DEFAULT_DEMO_REPORTER: User = {
  id: "usr-emp-1",
  name: "Alex Rivera",
  email: "alex.rivera@facility.internal",
  role: "employee",
  department: "Plant Maintenance & Electrical",
  facility_location: "Main Assembly Quadrant B",
  created_at: "2026-08-25T00:00:00Z"
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"report" | "manager" | "reporter_incidents" | "analytics" | "rules" | "chat" | "profile">("report");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_DEMO_REPORTER);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load cached session if available
    try {
      const savedUser = localStorage.getItem("safetywatch_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.warn("Could not read local auth cache:", e);
    }
  }, []);

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

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("safetywatch_user", JSON.stringify(user));
    } catch (e) {}

    // Route dynamically based on role
    if (user.role === "manager") {
      setActiveTab("manager");
    } else {
      setActiveTab("report");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("safetywatch_user");
    } catch (e) {}
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openIncidentsCount={stats?.open_incidents || 0}
        highRiskCount={stats?.high_risk_incidents || 0}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "report" && <EmployeeReportView />}
        {activeTab === "chat" && <SafetyChatbot userName={currentUser?.name || "Employee"} />}
        
        {/* Reporter's Personal Complaints Tracker */}
        {activeTab === "reporter_incidents" && currentUser && (
          <ReporterIncidentsView currentUser={currentUser} />
        )}

        {/* Safety Manager Operations Console */}
        {activeTab === "manager" && <ManagerDashboardView />}

        {activeTab === "analytics" && <StatsOverview />}
        {activeTab === "rules" && <SafetyRulesView />}
        {activeTab === "profile" && currentUser && (
          <ProfileSettingsView user={currentUser} onLogout={handleLogout} />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workplace SafetyWatch — Multi-Agent AI Hazard Detection & Incident System</span>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI</span>
            <span>•</span>
            <span>LangGraph (7 Agents)</span>
            <span>•</span>
            <span>Groq Vision/LLM</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>Next.js 14</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
