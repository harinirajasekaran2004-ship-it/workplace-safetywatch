import React from "react";
import { Gauge, Info, CheckCircle, Percent } from "lucide-react";
import { ConfidenceMetrics } from "@/lib/api";

interface ConfidenceMetricsCardProps {
  metrics: ConfidenceMetrics;
}

export const ConfidenceMetricsCard: React.FC<ConfidenceMetricsCardProps> = ({ metrics }) => {
  const metricItems = [
    { label: "Detection Confidence", value: metrics.detection_confidence, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Classification Confidence", value: metrics.classification_confidence, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Rule Match Confidence", value: metrics.rule_match_confidence, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Risk Assessment Confidence", value: metrics.risk_assessment_confidence, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">System Evaluation & Confidence Metrics</h3>
            <p className="text-xs text-slate-400">Multi-agent probabilistic inference scores</p>
          </div>
        </div>

        {/* Aggregate Overall Score */}
        <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs text-slate-300 font-medium">Overall Analysis Score:</span>
          <span className="text-base font-bold text-emerald-400">{metrics.overall_analysis_score}%</span>
        </div>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {metricItems.map((item, idx) => (
          <div
            key={idx}
            className={`${item.bg} border ${item.border} rounded-xl p-3.5 flex flex-col justify-between`}
          >
            <span className="text-[11px] font-medium text-slate-300 mb-2 leading-tight">{item.label}</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold ${item.color}`}>{item.value.toFixed(1)}%</span>
              <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden ml-2">
                <div
                  className={`h-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="flex items-start space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-slate-400 text-xs">
        <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Evaluation Disclaimer:</strong> {metrics.disclaimer || "Model confidence / system evaluation metrics - not certified legal or laboratory measurements."}
        </p>
      </div>
    </div>
  );
};
