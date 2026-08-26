import React, { useState } from "react";
import {
  Shield,
  User,
  Lock,
  Mail,
  Building,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { User as UserType, loginUser, registerUser } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  initialRole?: "employee" | "manager";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = "employee"
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [role, setRole] = useState<"employee" | "manager">(initialRole);
  
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleQuickLogin = async (asRole: "employee" | "manager") => {
    setLoading(true);
    setErrorMsg("");
    const targetEmail = asRole === "manager" ? "harinirajasekaran2004@gmail.com" : "alex.rivera@facility.internal";
    try {
      const res = await loginUser(targetEmail, "password123");
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Please provide your full name.");
        const res = await registerUser({
          name,
          email,
          password,
          role,
          department: department || (role === "manager" ? "EHS Compliance" : "Operations"),
          facility_location: location || "Main Plant"
        });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await loginUser(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {isRegister ? "Create SafetyWatch Account" : "Sign In to SafetyWatch"}
              </h3>
              <p className="text-xs text-slate-400">
                {isRegister ? "Join the facility safety network" : "Select role or enter credentials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="p-6 pb-2 bg-slate-950/50 border-b border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            ⚡ 1-Click Capstone Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("employee")}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 text-left transition-all hover:border-emerald-500/50 flex flex-col"
            >
              <span>👷 Reporter Demo</span>
              <span className="text-[10px] text-slate-400 font-normal">Alex Rivera (Lead Tech)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("manager")}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-400 text-left transition-all hover:border-blue-500/50 flex flex-col"
            >
              <span>🛡️ Manager Demo</span>
              <span className="text-[10px] text-slate-400 font-normal">Harini R (Safety Lead)</span>
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setRole("employee")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === "employee"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👷 Reporter / Employee
            </button>
            <button
              type="button"
              onClick={() => setRole("manager")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === "manager"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🛡️ Safety Manager
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5 text-emerald-400" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. worker@facility.internal"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Password *</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Operations"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Facility Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Sector 4"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
              role === "manager"
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
            }`}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? "Create Account & Sign In" : `Sign In as ${role === "manager" ? "Manager" : "Reporter"}`}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-emerald-400 font-bold hover:underline"
              >
                Sign In here
              </button>
            </span>
          ) : (
            <span>
              New to Workplace SafetyWatch?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-emerald-400 font-bold hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
