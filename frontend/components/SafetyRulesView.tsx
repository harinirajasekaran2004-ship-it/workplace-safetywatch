import React, { useState, useEffect } from "react";
import { BookOpen, ShieldCheck, Search, Tag, ExternalLink } from "lucide-react";
import { fetchSafetyRules } from "@/lib/api";

export const SafetyRulesView: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    fetchSafetyRules()
      .then(data => setRules(data))
      .catch(err => console.error("Failed to load safety rules", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rules.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
          <BookOpen className="h-6 w-6 text-emerald-400" />
          <span>Safety Rule & Compliance Standards Catalogue</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Curated facility hazard remediation rules referenced by the Safety Rule & Compliance Matching Agent.
        </p>

        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter rules by title, standard, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading safety compliance standards...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(rule => (
            <div
              key={rule.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {rule.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {rule.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{rule.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{rule.description}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Standard: <span className="text-slate-200">{rule.standard_reference}</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl text-xs text-emerald-300">
                <strong>Standard Corrective Action:</strong> {rule.default_corrective_action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
