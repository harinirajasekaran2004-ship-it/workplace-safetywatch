export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager";
  department?: string;
  facility_location?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface SafetyChatResponse {
  reply: string;
  is_relevant: boolean;
  matched_standards?: string[];
  timestamp: string;
}

export interface AgentStatuses {
  detection: "waiting" | "running" | "completed" | "failed";
  classification: "waiting" | "running" | "completed" | "failed";
  risk: "waiting" | "running" | "completed" | "failed";
  rules: "waiting" | "running" | "completed" | "failed";
  report: "waiting" | "running" | "completed" | "failed";
  notification: "waiting" | "running" | "completed" | "failed";
  resolution: "waiting" | "running" | "completed" | "failed";
}

export interface ConfidenceMetrics {
  detection_confidence: number;
  classification_confidence: number;
  rule_match_confidence: number;
  risk_assessment_confidence: number;
  overall_analysis_score: number;
  disclaimer: string;
}

export interface MatchedRule {
  rule_id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  why_it_applies: string;
  compliance_status: string;
  recommended_corrective_action: string;
}

export interface RiskAssessment {
  severity: "Low" | "Medium" | "High" | "Critical";
  likelihood: number;
  severity_score: number;
  risk_score: number;
  priority: "Low" | "Medium" | "High" | "Urgent";
  rationale: string;
  rubric_formula: string;
}

export interface IncidentReportSummary {
  incident_id: string;
  incident_code: string;
  created_at: string;
  hazard_type: string;
  category: string;
  description: string;
  location: string;
  reporter_name: string;
  risk_score: number;
  severity: string;
  priority: string;
  matched_rule: string;
  corrective_action: string;
  status: string;
}

export interface NotificationItem {
  recipient: string;
  channel: string;
  status: "simulated" | "actually sent" | "skipped" | "failed";
  sent_at?: string;
  subject: string;
  message: string;
}

export interface ResolutionUpdate {
  id?: string;
  updated_by: string;
  notes: string;
  status: "REPORTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
}

export interface Incident {
  id: string;
  incident_code: string;
  location: string;
  description: string;
  image_url?: string;
  hazard_detected: boolean;
  hazard_type?: string;
  category?: string;
  confidence?: number;
  risk_score?: number;
  severity?: "Low" | "Medium" | "High" | "Critical";
  priority?: "Low" | "Medium" | "High" | "Urgent";
  status: "REPORTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  reporter_name: string;
  reporter_email?: string;
  reporter_id?: string;
  assignee_name?: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
  risk_assessment?: RiskAssessment;
  matched_rules: MatchedRule[];
  incident_report?: IncidentReportSummary;
  notifications: NotificationItem[];
  resolution_updates: ResolutionUpdate[];
  agent_statuses: AgentStatuses;
  confidence_metrics?: ConfidenceMetrics;
  errors: string[];
}

export interface IncidentCreateResponse {
  success: boolean;
  message: string;
  incident_id: string;
  incident_code: string;
  hazard_detected: boolean;
  incident: Incident;
  agent_statuses: AgentStatuses;
  confidence_metrics?: ConfidenceMetrics;
}

export interface ReporterSummary {
  name: string;
  email: string;
  incidents_count: number;
  department?: string;
  facility_location?: string;
  latest_incident?: string;
}

export interface DashboardStats {
  total_incidents: number;
  open_incidents: number;
  high_risk_incidents: number;
  resolved_incidents: number;
  average_risk_score: number;
  category_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  total_reporters?: number;
  reporters_list?: ReporterSummary[];
  recent_incidents: Incident[];
}

/* ================= AUTHENTICATION APIS ================= */

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(errorData.detail || "Authentication error.");
    }
    return res.json();
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("⚠️ Backend server is offline. Please run start_backend.bat or start Uvicorn on port 8000.");
    }
    throw err;
  }
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role: "employee" | "manager";
  department?: string;
  facility_location?: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(errorData.detail || "Failed to create account.");
    }
    return res.json();
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("⚠️ Backend server is offline. Please run start_backend.bat or start Uvicorn on port 8000.");
    }
    throw err;
  }
}

export async function fetchAllUsers(role?: string): Promise<User[]> {
  const url = role ? `${API_BASE_URL}/api/auth/users?role=${role}` : `${API_BASE_URL}/api/auth/users`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users list");
  return res.json();
}

/* ================= SAFETY CHATBOT API ================= */

export async function sendSafetyChatMessage(
  message: string,
  history: ChatMessage[],
  userName: string = "Employee"
): Promise<SafetyChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat/safety-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, user_name: userName }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Chat service unavailable" }));
    throw new Error(errorData.detail || "Failed to query safety assistant.");
  }
  return res.json();
}

/* ================= INCIDENTS & PIPELINE APIS ================= */

export async function analyzeIncident(formData: FormData): Promise<IncidentCreateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/incidents/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Network response was not ok" }));
    throw new Error(errorData.detail || "Failed to analyze incident.");
  }
  return res.json();
}

export async function fetchIncidents(filters?: {
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
}): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.severity) params.append("severity", filters.severity);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);

  const url = `${API_BASE_URL}/api/incidents?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return res.json();
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE_URL}/api/incidents/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch incident ${id}`);
  }
  return res.json();
}

export async function updateIncident(
  id: string,
  updates: {
    status?: string;
    assignee_name?: string;
    assignee_id?: string;
    resolution_notes?: string;
    updated_by?: string;
  }
): Promise<Incident> {
  const res = await fetch(`${API_BASE_URL}/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update incident ${id}`);
  }
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }
  return res.json();
}

export async function fetchSafetyRules(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/safety-rules`);
  if (!res.ok) {
    throw new Error("Failed to fetch safety rules catalog");
  }
  return res.json();
}

export function getIncidentPdfUrl(id: string): string {
  return `${API_BASE_URL}/api/incidents/${id}/pdf`;
}

export async function sendIncidentEmail(id: string, recipient?: string): Promise<{ success: boolean; message: string }> {
  const url = recipient
    ? `${API_BASE_URL}/api/incidents/${id}/send-email?recipient=${encodeURIComponent(recipient)}`
    : `${API_BASE_URL}/api/incidents/${id}/send-email`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to dispatch email notification");
  }
  return res.json();
}
