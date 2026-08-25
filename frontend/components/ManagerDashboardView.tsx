import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Shield,
  Eye
} from "lucide-react";
import { Incident, fetchIncidents } from "@/lib/api";
import { IncidentDetailModal } from "./IncidentDetailModal";

const CATEGORIES = [
  "All",
  "Electrical",
  "Fire",
  "PPE",
  "Slip/Trip",
  "Machinery",
  "Chemical",
  "Emergency Exit",
  "Structural",
  "Housekeeping",
  "Other"
];

export const ManagerDashboardView: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents({
        status: statusFilter !== "All" ? statusFilter : undefined,
        severity: severityFilter !== "All" ? severityFilter : undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        search: searchQuery || undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, severityFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIncidents();
  };

  const handleIncidentUpdated = (updated: Incident) => {
    setIncidents(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    setSelectedIncident(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span>Safety Operations & Incident Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-agent triage, assignment, and corrective remediation console.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by incident code, location, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading incident records...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No incidents match the active filters.</p>
            <p className="text-xs">Try resetting filters or reporting a new hazard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Incident Code</th>
                  <th className="px-5 py-4">Location & Summary</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Risk & Severity</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Assignee</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {incidents.map(inc => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                      {inc.incident_code}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-white text-sm truncate">
                        {inc.hazard_detected ? inc.hazard_type : "Verified Safe"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{inc.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {inc.category || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          inc.severity === "Critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : inc.severity === "High"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : inc.severity === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {inc.severity || "Low"}
                        </span>
                        <span className="font-mono text-slate-400">{inc.risk_score || 0}/100</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        inc.status === "RESOLVED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : inc.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {inc.assignee_name || (
                        <span className="italic text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdated={handleIncidentUpdated}
        />
      )}
    </div>
  );
};
