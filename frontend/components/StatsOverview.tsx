import React, { useState, useEffect } from "react";
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";
import { DashboardStats, fetchDashboardStats } from "@/lib/api";

export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load dashboard stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Aggregating facility safety KPIs...</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Incidents Logged", value: stats.total_incidents, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active / Open Hazards", value: stats.open_incidents, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "High & Critical Hazards", value: stats.high_risk_incidents, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Successfully Remediated", value: stats.resolved_incidents, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            <span>Facility Safety Analytics & Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated hazard distributions, risk scores, and remediation performance metrics.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center space-x-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Risk Score</span>
            <span className="text-base font-bold text-emerald-300">{stats.average_risk_score} / 100</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`${kpi.bg} border ${kpi.border} rounded-2xl p-5 flex items-center justify-between shadow-sm`}
            >
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">{kpi.label}</span>
                <span className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</span>
              </div>
              <div className={`p-3 rounded-xl bg-slate-900/60 ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Incidents by Hazard Category</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(stats.category_counts).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No incidents recorded yet.</p>
            ) : (
              Object.entries(stats.category_counts).map(([cat, count]) => {
                const pct = stats.total_incidents > 0 ? (count / stats.total_incidents) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-emerald-400 font-bold">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Severity Level Distribution</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { level: "Critical", count: stats.severity_counts["Critical"] || 0, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
              { level: "High", count: stats.severity_counts["High"] || 0, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { level: "Medium", count: stats.severity_counts["Medium"] || 0, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { level: "Low", count: stats.severity_counts["Low"] || 0, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map(s => (
              <div key={s.level} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                <span className="text-xs font-semibold text-slate-300 block mb-1">{s.level} Severity</span>
                <span className={`text-xl font-bold ${s.color}`}>{s.count} Incidents</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl text-xs text-slate-400">
            High and Critical severity incidents automatically trigger real-time manager escalation notifications.
          </div>
        </div>
      </div>
    </div>
  );
};
