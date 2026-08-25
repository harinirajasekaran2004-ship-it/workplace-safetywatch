import React, { useState } from "react";
import {
  UploadCloud,
  FileImage,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Bell
} from "lucide-react";
import { analyzeIncident, Incident, AgentStatuses, ConfidenceMetrics } from "@/lib/api";
import { LiveAgentTimeline } from "./LiveAgentTimeline";
import { ConfidenceMetricsCard } from "./ConfidenceMetricsCard";

const DEMO_PRESETS = [
  {
    title: "⚡ Exposed Electrical Wires (Demo Scenario)",
    location: "Electrical Room B2",
    description: "Exposed live wiring dangling near active high-voltage breaker panel with visible spark residue.",
    reporter: "Alex Rivera (Lead Technician)",
    imagePreview: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "💧 Wet / Slippery Floor in Warehouse",
    location: "Main Warehouse Aisle 3",
    description: "Industrial coolant liquid leak creating heavy slip and forklift skid hazard without warning signs.",
    reporter: "Sarah Vance (Floor Supervisor)",
    imagePreview: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "🚪 Blocked Emergency Exit Door",
    location: "South Corridor Exit Gate 4",
    description: "Wooden storage pallets and discarded machinery stacked directly blocking emergency egress fire door.",
    reporter: "David Kim (Logistics)",
    imagePreview: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "🛡️ Safe Area (No Hazard Early Exit)",
    location: "Admin Office Floor 2",
    description: "All safe, clean and clear unobstructed floor with normal condition inspection.",
    reporter: "Audit Team",
    imagePreview: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"
  }
];

export const EmployeeReportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [location, setLocation] = useState<string>("Electrical Room B2");
  const [description, setDescription] = useState<string>("Exposed live wires dangling from open junction box with visible spark marks.");
  const [reporter, setReporter] = useState<string>("Alex Rivera (Lead Tech)");
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatuses>({
    detection: "waiting",
    classification: "waiting",
    risk: "waiting",
    rules: "waiting",
    report: "waiting",
    notification: "waiting",
    resolution: "waiting",
  });
  
  const [resultIncident, setResultIncident] = useState<Incident | null>(null);
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const applyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setLocation(preset.location);
    setDescription(preset.description);
    setReporter(preset.reporter);
    setPreviewUrl(preset.imagePreview);
    setSelectedFile(null); // Simulated image URL
    setResultIncident(null);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMessage("Please specify the hazard location.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setResultIncident(null);

    // Dynamic pipeline step simulation for visible UX while backend responds
    setAgentStatuses({
      detection: "running",
      classification: "waiting",
      risk: "waiting",
      rules: "waiting",
      report: "waiting",
      notification: "waiting",
      resolution: "waiting",
    });

    const formData = new FormData();
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    formData.append("location", location);
    formData.append("description", description);
    formData.append("reporter", reporter);

    try {
      // Step timer animations
      const t1 = setTimeout(() => {
        setAgentStatuses(s => ({ ...s, detection: "completed", classification: "running" }));
      }, 400);

      const t2 = setTimeout(() => {
        setAgentStatuses(s => ({ ...s, classification: "completed", risk: "running" }));
      }, 900);

      const t3 = setTimeout(() => {
        setAgentStatuses(s => ({ ...s, risk: "completed", rules: "running" }));
      }, 1400);

      const response = await analyzeIncident(formData);

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      setAgentStatuses(response.agent_statuses);
      setResultIncident(response.incident);
      if (response.confidence_metrics) {
        setConfidenceMetrics(response.confidence_metrics);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze incident.");
      setAgentStatuses({
        detection: "failed",
        classification: "failed",
        risk: "failed",
        rules: "failed",
        report: "failed",
        notification: "failed",
        resolution: "failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Multi-Agent Workplace Safety Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Report a Workplace Hazard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload a photo or submit observations. Seven specialized AI agents will autonomously inspect, categorize, calculate explainable risk scores, match compliance guidelines, and notify safety managers in real time.
          </p>
        </div>

        {/* Demo Quick Presets */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Quick Capstone Demo Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left text-xs font-medium px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-emerald-500/50 hover:shadow-md flex items-center justify-between group"
              >
                <span className="truncate">{p.title}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity ml-1 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Submission Form & Live Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. Hazard Photo Upload
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                  previewUrl
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                }`}
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Hazard preview"
                      className="max-h-48 mx-auto rounded-xl object-cover shadow-md border border-slate-700"
                    />
                    <div className="flex items-center justify-center space-x-2">
                      <label className="cursor-pointer text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-400">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-6">
                    <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Click to upload or drag image here
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                <span>2. Facility Location *</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Electrical Room B2, Loading Dock A, Assembly Line 4"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <span>3. Observed Conditions & Details</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what you observed (e.g., exposed live cables, missing grounding wire, water pooling)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Reporter Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-emerald-500" />
                <span>4. Reporter Name / Role</span>
              </label>
              <input
                type="text"
                value={reporter}
                onChange={e => setReporter(e.target.value)}
                placeholder="e.g. Alex Rivera (Lead Technician)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center space-x-2">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Orchestrating 7 Agents...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Analyze & Dispatch Incident Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Agent Timeline */}
        <div className="lg:col-span-6 space-y-6">
          <LiveAgentTimeline
            statuses={agentStatuses}
            isCompleted={Boolean(resultIncident)}
            hasErrors={Boolean(errorMessage)}
          />

          {confidenceMetrics && (
            <ConfidenceMetricsCard metrics={confidenceMetrics} />
          )}
        </div>
      </div>

      {/* Resulting Incident Report Card */}
      {resultIncident && (
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center space-x-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                resultIncident.hazard_detected
                  ? resultIncident.severity === "Critical" || resultIncident.severity === "High"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {resultIncident.hazard_detected ? <ShieldAlert className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-emerald-400 font-bold border border-slate-700">
                    {resultIncident.incident_code}
                  </span>
                  <h2 className="text-xl font-bold text-white">
                    {resultIncident.hazard_detected ? resultIncident.hazard_type : "No Safety Hazard Detected"}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Location: <strong className="text-slate-200">{resultIncident.location}</strong> • Reported by {resultIncident.reporter_name}
                </p>
              </div>
            </div>

            {/* Severity & Status Badges */}
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                resultIncident.severity === "Critical"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : resultIncident.severity === "High"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : resultIncident.severity === "Medium"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-emerald-500 text-white"
              }`}>
                Severity: {resultIncident.severity}
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Risk Score: {resultIncident.risk_score}/100
              </span>
            </div>
          </div>

          {/* Incident Report Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Assessment Rubric Card */}
            {resultIncident.risk_assessment && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Explainable Risk Assessment Rubric</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Priority: <strong className="text-amber-400">{resultIncident.priority}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Severity Score:</span>
                    <p className="font-bold text-white text-sm">{resultIncident.risk_assessment.severity_score} / 5</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Likelihood Score:</span>
                    <p className="font-bold text-white text-sm">{resultIncident.risk_assessment.likelihood} / 5</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-200">Rationale:</strong> {resultIncident.risk_assessment.rationale}
                </p>
              </div>
            )}

            {/* Safety Rule & Compliance Matching Card */}
            {resultIncident.matched_rules && resultIncident.matched_rules.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Safety Rule & Compliance Matching</span>
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    {resultIncident.matched_rules[0].compliance_status}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-300">
                    [{resultIncident.matched_rules[0].code}] {resultIncident.matched_rules[0].title}
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    {resultIncident.matched_rules[0].why_it_applies}
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300">
                  <strong>Recommended Corrective Action:</strong> {resultIncident.matched_rules[0].recommended_corrective_action}
                </div>
              </div>
            )}
          </div>

          {/* Manager Notification Alert Banner */}
          {resultIncident.notifications && resultIncident.notifications.length > 0 && (
            <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-200">
              <Bell className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <strong className="text-blue-300">Manager Notification Status:</strong>
                  <span className="uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                    {resultIncident.notifications[0].status}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    Recipient: {resultIncident.notifications[0].recipient}
                  </span>
                </div>
                <p className="text-slate-300">{resultIncident.notifications[0].subject}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
