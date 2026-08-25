-- Workplace SafetyWatch Supabase Database Schema
-- Run this migration against your Supabase Postgres Database

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_code VARCHAR(50) UNIQUE NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255) DEFAULT 'Employee',
    location VARCHAR(255) NOT NULL,
    description TEXT,
    hazard_detected BOOLEAN DEFAULT TRUE,
    hazard_type VARCHAR(255),
    category VARCHAR(100),
    confidence NUMERIC(5, 2),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    priority VARCHAR(50) CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status VARCHAR(50) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Hazards Table
CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    image_path TEXT,
    detected_description TEXT,
    detection_confidence NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Risk Assessments Table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    severity VARCHAR(50) NOT NULL,
    likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
    severity_score INTEGER NOT NULL CHECK (severity_score >= 1 AND severity_score <= 5),
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    priority VARCHAR(50) NOT NULL,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Safety Rules Catalog Table
CREATE TABLE IF NOT EXISTS safety_rules (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    standard_reference VARCHAR(255),
    default_corrective_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Incident Matched Rules Table
CREATE TABLE IF NOT EXISTS incident_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) REFERENCES safety_rules(id) ON DELETE RESTRICT,
    why_it_applies TEXT NOT NULL,
    compliance_status VARCHAR(100) NOT NULL,
    corrective_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    recipient VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'email',
    status VARCHAR(50) NOT NULL CHECK (status IN ('simulated', 'actually sent', 'skipped', 'failed')),
    subject VARCHAR(255),
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Resolution Updates Table
CREATE TABLE IF NOT EXISTS resolution_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    updated_by VARCHAR(255) NOT NULL,
    notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Agent Runs Table (Observability & Audit Trail)
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('waiting', 'running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
