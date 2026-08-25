import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  ShieldCheck,
  Bell,
  Clock,
  UserCheck,
  CheckCircle,
  FileEdit,
  History,
  Send,
  FileDown
} from "lucide-react";
import { Incident, updateIncident, getIncidentPdfUrl } from "@/lib/api";

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onUpdated: (updatedIncident: Incident) => void;
}

const SAMPLE_ASSIGNEES = [
  "Sarah Connor (Safety Lead)",
  "Fox Mulder (HazMat Officer)",
  "John Doe (Senior Electrician)",
  "Marcus Vance (Facility Operations)",
  "Elena Rostova (Compliance Inspector)"
];

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdated
}) => {
  const [status, setStatus] = useState<string>(incident.status);
  const [assigneeName, setAssigneeName] = useState<string>(incident.assignee_name || SAMPLE_ASSIGNEES[0]);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string>("");

  const handleUpdate = async (newStatus?: string) => {
    setIsUpdating(true);
    setUpdateSuccessMsg("");
    const chosenStatus = newStatus || status;

    try {
      const updated = await updateIncident(incident.id, {
        status: chosenStatus,
        assignee_name: assigneeName,
        resolution_notes: resolutionNotes || (newStatus === "RESOLVED" ? "Marked as resolved by manager." : undefined),
        updated_by: "Manager"
      });
      setStatus(updated.status);
      setResolutionNotes("");
      setUpdateSuccessMsg(`Status updated to ${updated.status} successfully.`);
      onUpdated(updated);
    } catch (err: any) {
      alert("Failed to update incident: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-5 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm px-3 py-1 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-slate-700">
              {incident.incident_code}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {incident.hazard_detected ? incident.hazard_type : "No Hazard Incident"}
              </h2>
              <p className="text-xs text-slate-400">
                {incident.location} • Reported on {new Date(incident.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={getIncidentPdfUrl(incident.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium block mb-1">Status</span>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                status === "RESOLVED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : status === "IN_PROGRESS"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {status}
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium block mb-1">Severity</span>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                incident.severity === "Critical" || incident.severity === "High"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {incident.severity || "Medium"}
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium block mb-1">Risk Score</span>
              <span className="text-xl font-bold text-white">{incident.risk_score || 0}<span className="text-xs text-slate-400">/100</span></span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium block mb-1">Category</span>
              <span className="text-sm font-semibold text-emerald-400">{incident.category || "General"}</span>
            </div>
          </div>

          {/* Description & Observation */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Reported Hazard Description
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">{incident.description}</p>
          </div>

          {/* Matched Safety Rules */}
          {incident.matched_rules && incident.matched_rules.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Safety Rule & Compliance Matching</span>
              </h4>
              {incident.matched_rules.map((rule, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300">
                      [{rule.code}] {rule.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {rule.compliance_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{rule.why_it_applies}</p>
                  <div className="text-xs text-emerald-400/90 pt-1">
                    <strong>Recommended Action:</strong> {rule.recommended_corrective_action}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manager Action Panel */}
          <div className="bg-slate-800/80 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-700">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Manager Resolution & Assignment Actions</h3>
            </div>

            {updateSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Responsible Officer:
                </label>
                <select
                  value={assigneeName}
                  onChange={e => setAssigneeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SAMPLE_ASSIGNEES.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Incident Status:
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="REPORTED">REPORTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resolution & Corrective Action Notes:
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="e.g., Electrician repaired junction box and replaced frayed conductors. Verified 0V de-energized condition before sealing."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdate()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <FileEdit className="h-4 w-4" />
                <span>Save Updates</span>
              </button>

              <button
                type="button"
                disabled={isUpdating || status === "RESOLVED"}
                onClick={() => handleUpdate("RESOLVED")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>One-Click Mark Resolved</span>
              </button>
            </div>
          </div>

          {/* Audit Trail / Resolution Updates */}
          {incident.resolution_updates && incident.resolution_updates.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <History className="h-4 w-4" />
                <span>Audit & Resolution History</span>
              </h4>
              <div className="space-y-2">
                {incident.resolution_updates.map((update, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between">
                    <div>
                      <strong className="text-slate-200">{update.updated_by}</strong>: {update.notes}
                    </div>
                    <span className="text-[10px] text-slate-400 ml-4 font-mono flex-shrink-0">
                      {new Date(update.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
