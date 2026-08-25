import logging
import smtplib
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_MANAGER_EMAIL = "harinirajasekaran2004@gmail.com"

def send_incident_notification_email(
    incident: Dict[str, Any],
    recipient: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatches a high-priority safety alert email directly to harinirajasekaran2004@gmail.com
    using HTTP Email Dispatch + SMTP fallback.
    """
    to_email = recipient or DEFAULT_MANAGER_EMAIL
    incident_code = incident.get("incident_code", "WS-1024")
    severity = str(incident.get("severity", "High")).upper()
    risk_score = incident.get("risk_score", 88)
    location = incident.get("location", "Facility")
    category = incident.get("category", "General")
    desc = incident.get("description", "Hazard detected.")
    matched_rules = incident.get("matched_rules", [])
    rule_title = matched_rules[0].get("title", "Safety Rule") if matched_rules else "Safety Compliance Rule"
    corrective_action = matched_rules[0].get("recommended_corrective_action", "De-energize and inspect immediately.") if matched_rules else "Mitigate immediately."

    subject = f"[CRITICAL SAFETY ALERT] {severity} Hazard Detected: {incident_code} at {location}"
    
    email_body = f"""
WORKPLACE SAFETYWATCH — CRITICAL HAZARD NOTIFICATION
======================================================
Incident Code: {incident_code}
Severity Level: {severity} ({risk_score}/100 Risk Score)
Category: {category}
Location: {location}
Date/Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
Reporter: {incident.get('reporter_name', 'Employee')}

Observed Hazard Description:
{desc}

Matched Compliance Standard:
{rule_title}

Recommended Immediate Corrective Action:
{corrective_action}

Status: {incident.get('status', 'REPORTED')}
======================================================
Autonomously orchestrated & dispatched by the Workplace SafetyWatch Multi-Agent AI Pipeline.
"""

    status = "actually sent"
    sent_at = datetime.now(timezone.utc).isoformat()
    dispatch_method = "http_relay"

    # 1. Primary: Direct HTTP Email Relay (Zero-password required)
    try:
        url = f"https://formsubmit.co/ajax/{to_email}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json",
            "Referer": "http://localhost:3000"
        }
        payload = {
            "_subject": subject,
            "Incident_Code": incident_code,
            "Severity": f"{severity} ({risk_score}/100)",
            "Category": category,
            "Location": location,
            "Hazard_Description": desc,
            "Compliance_Standard": rule_title,
            "Corrective_Action": corrective_action,
            "Full_Report": email_body,
            "_template": "table"
        }
        res = httpx.post(url, headers=headers, json=payload, timeout=8.0)
        logger.info(f"Direct email dispatch response ({res.status_code}): {res.text}")
        status = "actually sent"
    except Exception as e:
        logger.warning(f"HTTP email dispatch notice: {e}")
        status = "simulated"

    # 2. Secondary: SMTP fallback if configured
    smtp_user = getattr(settings, "SMTP_USER", "").strip()
    smtp_password = getattr(settings, "SMTP_PASSWORD", "").strip()
    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.SMTP_FROM_NAME} <{smtp_user}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(email_body, 'plain'))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8)
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [to_email], msg.as_string())
            server.quit()
            status = "actually sent"
            dispatch_method = "smtp"
        except Exception as e:
            logger.error(f"SMTP error: {e}")

    return {
        "recipient": to_email,
        "channel": "email",
        "status": status,
        "sent_at": sent_at,
        "subject": subject,
        "message": email_body,
        "dispatch_method": dispatch_method
    }
