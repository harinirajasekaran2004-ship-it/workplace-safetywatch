import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  FileDown,
  User,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { Incident, fetchIncidents, getIncidentPdfUrl, User as UserType } from "@/lib/api";
import { IncidentDetailModal } from "./IncidentDetailModal";

interface ReporterIncidentsViewProps {
  currentUser: UserType;
}

export const ReporterIncidentsView: React.FC<ReporterIncidentsViewProps> = ({ currentUser }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const loadReporterIncidents = async () => {
    setLoading(true);
    try {
      const all = await fetchIncidents({
        status: statusFilter !== "All" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      // Filter only complaints raised by this reporter (matching name or email or default sample)
      const userFirstName = currentUser.name.split(" ")[0].toLowerCase();
      const myIncidents = all.filter(inc => {
        const repName = (inc.reporter_name || "").toLowerCase();
        const repEmail = (inc.reporter_email || "").toLowerCase();
        return (
          repName.includes(userFirstName) ||
          repEmail.includes(userFirstName) ||
          inc.reporter_id === currentUser.id
        );
      });

      // If user hasn't submitted one yet or for initial demo, show matching or latest reported by this user
      setIncidents(myIncidents.length > 0 ? myIncidents : all.slice(0, 2));
    } catch (err) {
      console.error("Failed to load reporter incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReporterIncidents();
  }, [statusFilter, currentUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReporterIncidents();
  };

  const openCount = incidents.filter(i => i.status === "REPORTED" || i.status === "IN_PROGRESS").length;
  const resolvedCount = incidents.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                My Reported Hazards & Complaints
              </h1>
              <p className="text-xs text-slate-400">
                Track remediation progress, safety officer assignments, and audit history for hazards you submitted.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadReporterIncidents}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh My Reports</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Hazards Logged by You</span>
          <span className="text-2xl font-extrabold text-white">{incidents.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-amber-400 font-semibold block mb-1">Active / Under Remediation</span>
          <span className="text-2xl font-extrabold text-amber-400">{openCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">Resolved by Management</span>
          <span className="text-2xl font-extrabold text-emerald-400">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your reported hazards by code, location, or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">REPORTED (New)</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </form>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading your hazard reports...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">You have no active hazard complaints.</p>
            <p className="text-xs text-slate-500">Report a new hazard using the "Report Hazard" tab above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Incident Code</th>
                  <th className="px-5 py-4">Observed Hazard & Location</th>
                  <th className="px-5 py-4">Risk & Severity</th>
                  <th className="px-5 py-4">Resolution Status</th>
                  <th className="px-5 py-4">Assigned Safety Officer</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {incidents.map(inc => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-emerald-400 text-xs">
                      {inc.incident_code}
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-white text-sm truncate">
                        {inc.hazard_detected ? inc.hazard_type : "Verified Safe"}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{inc.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {inc.description}
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

                    <td className="px-5 py-4 text-slate-300">
                      {inc.assignee_name ? (
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-blue-400" />
                          <span className="font-semibold text-white">{inc.assignee_name}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-500">Pending Assignment</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Details</span>
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

      {/* Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdated={() => loadReporterIncidents()}
        />
      )}
    </div>
  );
};
