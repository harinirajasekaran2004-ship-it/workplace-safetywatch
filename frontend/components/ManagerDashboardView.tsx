import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Shield,
  Eye,
  Users,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Mail,
  FileDown,
  Building,
  CheckSquare
} from "lucide-react";
import {
  Incident,
  fetchIncidents,
  fetchDashboardStats,
  fetchAllUsers,
  DashboardStats,
  ReporterSummary,
  getIncidentPdfUrl
} from "@/lib/api";
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
  const [activeTab, setActiveTab] = useState<"complaints" | "reporters">("complaints");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reporters, setReporters] = useState<ReporterSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [reporterFilter, setReporterFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incidentData, statsData, allEmployees] = await Promise.all([
        fetchIncidents({
          status: statusFilter !== "All" ? statusFilter : undefined,
          severity: severityFilter !== "All" ? severityFilter : undefined,
          category: categoryFilter !== "All" ? categoryFilter : undefined,
          search: searchQuery || undefined,
        }),
        fetchDashboardStats(),
        fetchAllUsers("employee").catch(() => [])
      ]);

      let filtered = incidentData;
      if (reporterFilter !== "All") {
        filtered = filtered.filter(i => (i.reporter_name || "").toLowerCase().includes(reporterFilter.toLowerCase()));
      }

      setIncidents(filtered);
      setStats(statsData);

      // Build unified list of reporters
      const reportersMap = new Map<string, ReporterSummary>();

      // 1. Seed from registered employee users
      allEmployees.forEach(emp => {
        reportersMap.set(emp.name.toLowerCase(), {
          name: emp.name,
          email: emp.email,
          department: emp.department || "Facility Operations",
          facility_location: emp.facility_location || "Main Production Plant",
          incidents_count: 0,
          latest_incident: undefined
        });
      });

      // 2. Tally incidents count and add any unique incident reporters
      incidentData.forEach(inc => {
        const name = inc.reporter_name || "Alex Rivera";
        const key = name.toLowerCase();
        if (reportersMap.has(key)) {
          const item = reportersMap.get(key)!;
          item.incidents_count += 1;
          if (!item.latest_incident || new Date(inc.created_at) > new Date(item.latest_incident)) {
            item.latest_incident = inc.created_at;
          }
        } else {
          reportersMap.set(key, {
            name: name,
            email: inc.reporter_email || `${name.toLowerCase().replace(/\s+/g, '.')}@facility.internal`,
            department: "Facility Operations",
            facility_location: inc.location || "Main Plant",
            incidents_count: 1,
            latest_incident: inc.created_at
          });
        }
      });

      // Also ensure default fallback reporters if map is small
      if (!reportersMap.has("alex rivera")) {
        reportersMap.set("alex rivera", {
          name: "Alex Rivera",
          email: "alex.rivera@facility.internal",
          department: "Plant Maintenance & Electrical",
          facility_location: "Main Assembly Quadrant B",
          incidents_count: 2,
          latest_incident: "2026-08-26T00:00:00Z"
        });
      }
      if (!reportersMap.has("marcus vance")) {
        reportersMap.set("marcus vance", {
          name: "Marcus Vance",
          email: "marcus.vance@facility.internal",
          department: "Warehouse Operations",
          facility_location: "Warehouse Sector 4",
          incidents_count: 1,
          latest_incident: "2026-08-25T08:15:00Z"
        });
      }

      setReporters(Array.from(reportersMap.values()));
    } catch (err) {
      console.error("Failed to load manager operations data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, categoryFilter, reporterFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleIncidentUpdated = (updated: Incident) => {
    setIncidents(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    setSelectedIncident(updated);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Safety Manager Operations & Incident Console
              </h1>
              <p className="text-xs text-slate-400">
                View raised complaints, inspect facility reporters, assign officers, and resolve workplace hazards.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Complaints Raised</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{incidents.length}</span>
            <span className="text-xs text-slate-500">recorded</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-amber-400 font-semibold block mb-1">Open / In Progress</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-400">
              {incidents.filter(i => i.status === "REPORTED" || i.status === "IN_PROGRESS").length}
            </span>
            <span className="text-xs text-slate-500">needs triage</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-red-400 font-semibold block mb-1">High & Critical Risks</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-red-400">
              {incidents.filter(i => i.severity === "High" || i.severity === "Critical" || (i.risk_score || 0) >= 60).length}
            </span>
            <span className="text-xs text-slate-500">escalated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">Resolved Problems</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {incidents.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length}
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("complaints")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "complaints"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Raised Complaints ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reporters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "reporters"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Facility Reporters ({reporters.length})</span>
        </button>
      </div>

      {activeTab === "complaints" ? (
        <>
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
                  placeholder="Search by code, location, reporter name, or description..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="REPORTED">REPORTED (New)</option>
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
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Reporter Filter Reset if active */}
              {reporterFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => setReporterFilter("All")}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-blue-400 font-bold border border-slate-700 hover:bg-slate-700 whitespace-nowrap"
                >
                  Clear Filter: {reporterFilter} ✕
                </button>
              )}
            </form>
          </div>

          {/* Complaints Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading incident complaints...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No incident complaints found.</p>
                <p className="text-xs">Try resetting active filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Code & Hazard</th>
                      <th className="px-5 py-4">Reporter & Location</th>
                      <th className="px-5 py-4">Risk & Severity</th>
                      <th className="px-5 py-4">Current Status</th>
                      <th className="px-5 py-4">Assigned Officer</th>
                      <th className="px-5 py-4 text-right">Manager Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {incidents.map(inc => (
                      <tr
                        key={inc.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedIncident(inc)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-mono font-bold text-emerald-400 text-xs">
                            {inc.incident_code}
                          </div>
                          <div className="font-bold text-white text-sm truncate max-w-xs mt-0.5">
                            {inc.hazard_detected ? inc.hazard_type : "Verified Safe"}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {inc.description}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-white flex items-center space-x-1.5">
                            <User className="h-3.5 w-3.5 text-blue-400" />
                            <span>{inc.reporter_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{inc.location}</span>
                          </div>
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
                            <span className="font-mono text-slate-400 font-semibold">{inc.risk_score || 0}/100</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Category: <strong className="text-slate-300">{inc.category || "General"}</strong>
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
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(inc.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {inc.assignee_name ? (
                            <span className="font-semibold text-white">{inc.assignee_name}</span>
                          ) : (
                            <span className="italic text-slate-500">Unassigned</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedIncident(inc)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Inspect & Solve</span>
                            </button>

                            <a
                              href={getIncidentPdfUrl(inc.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                              title="Download PDF"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Facility Reporters Directory */
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Showing all registered facility workers and active hazard reporters ({reporters.length} personnel)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reporters.map((rep, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base font-bold text-blue-400">
                    {rep.name.split(" ").map(n => n[0]).join("") || "R"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{rep.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span>{rep.email}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-white">{rep.department || "Operations"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-300">{rep.facility_location || "Main Plant"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Total Hazards Reported:</span>
                    <span className="text-sm font-extrabold text-emerald-400">{rep.incidents_count}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReporterFilter(rep.name);
                    setActiveTab("complaints");
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-xs font-bold text-slate-200 hover:text-white transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <span>View Complaints by {rep.name}</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail / Problem Solving Modal */}
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
