import React from "react";
import { CheckCircle2, Loader2, Circle, AlertOctagon, ShieldAlert, Cpu } from "lucide-react";
import { AgentStatuses } from "@/lib/api";

interface LiveAgentTimelineProps {
  statuses: AgentStatuses;
  isCompleted?: boolean;
  hasErrors?: boolean;
}

interface StepConfig {
  key: keyof AgentStatuses;
  title: string;
  description: string;
  agentName: string;
}

const STEPS: StepConfig[] = [
  {
    key: "detection",
    title: "Hazard Detection",
    description: "Analyzing visual input and telemetry for active workplace hazard existence.",
    agentName: "Agent 1: Hazard Detection Node",
  },
  {
    key: "classification",
    title: "Hazard Classification",
    description: "Categorizing hazard into standard taxonomy (Electrical, Fire, PPE, Slip/Trip, etc.).",
    agentName: "Agent 2: Hazard Classification Node",
  },
  {
    key: "risk",
    title: "Risk Assessment",
    description: "Executing explainable rubric for Severity (1-5), Likelihood (1-5), and Priority.",
    agentName: "Agent 3: Risk Assessment Node",
  },
  {
    key: "rules",
    title: "Safety Rule & Compliance Matching",
    description: "Retrieving matching rules from standards catalogue & formulating corrective action.",
    agentName: "Agent 4: Compliance Matching Node",
  },
  {
    key: "report",
    title: "Incident Report Generation",
    description: "Compiling formal structured incident document with unique identifier (WS-XXXX).",
    agentName: "Agent 5: Incident Report Node",
  },
  {
    key: "notification",
    title: "Manager Notification",
    description: "Evaluating escalation threshold and simulating/dispatching high-risk manager alerts.",
    agentName: "Agent 6: Notification Node",
  },
  {
    key: "resolution",
    title: "Resolution & Follow-up Tracking",
    description: "Registering incident into manager portal for assignment and lifecycle remediation.",
    agentName: "Agent 7: Resolution Tracking Node",
  },
];

export const LiveAgentTimeline: React.FC<LiveAgentTimelineProps> = ({
  statuses,
  isCompleted = false,
  hasErrors = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">LangGraph Multi-Agent Pipeline</h3>
            <p className="text-xs text-slate-400">Live orchestration of 7 specialized AI agents</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Pipeline Complete
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Agents Executing
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const status = statuses[step.key] || "waiting";
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.key} className="relative flex items-start space-x-4">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 -ml-px w-0.5 h-full ${
                    status === "completed" ? "bg-emerald-500/50" : "bg-slate-800"
                  }`}
                />
              )}

              {/* Status Icon */}
              <div className="relative flex-shrink-0 z-10">
                {status === "completed" && (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                  </div>
                )}
                {status === "running" && (
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center animate-spin shadow-lg shadow-amber-500/10">
                    <Loader2 className="h-5 w-5 stroke-[2.5]" />
                  </div>
                )}
                {status === "failed" && (
                  <div className="h-8 w-8 rounded-full bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center">
                    <AlertOctagon className="h-5 w-5" />
                  </div>
                )}
                {status === "waiting" && (
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center">
                    <Circle className="h-4 w-4 stroke-[1.5]" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-sm font-semibold ${
                        status === "completed"
                          ? "text-emerald-300"
                          : status === "running"
                          ? "text-amber-300 font-bold"
                          : status === "failed"
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">[{step.agentName}]</span>
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : status === "running"
                        ? "bg-amber-500/10 text-amber-400 animate-pulse"
                        : status === "failed"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
