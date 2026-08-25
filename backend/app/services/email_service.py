import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_MANAGER_EMAIL = "harinirajasekaran2004@gmail.com"

def generate_html_alert(incident: Dict[str, Any]) -> str:
    incident_code = incident.get("incident_code", "WS-1024")
    severity = str(incident.get("severity", "High")).upper()
    risk_score = incident.get("risk_score", 88)
    location = incident.get("location", "Facility")
    category = incident.get("category", "General")
    desc = incident.get("description", "Active hazard condition observed.")
    matched_rules = incident.get("matched_rules", [])
    primary_rule = matched_rules[0] if matched_rules else {}
    rule_title = primary_rule.get("title", "Workplace Safety Mandate")
    corrective_action = primary_rule.get("recommended_corrective_action", "Inspect and de-energize area immediately.")
    reporter = incident.get("reporter_name", "Employee")
    
    sev_bg = "#dc2626" if severity in ["HIGH", "CRITICAL"] else "#d97706"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }}
    .card {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background-color: {sev_bg}; padding: 24px; text-align: center; color: white; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }}
    .header p {{ margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }}
    .content {{ padding: 24px; }}
    .badge-bar {{ display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 16px; }}
    .badge {{ display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; background-color: #0f172a; border: 1px solid #334155; }}
    .badge-code {{ color: #10b981; }}
    .badge-risk {{ color: #ef4444; }}
    .section {{ margin-bottom: 18px; }}
    .section-title {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: bold; margin-bottom: 6px; }}
    .section-body {{ font-size: 14px; color: #e2e8f0; line-height: 1.5; background: #0f172a; padding: 12px 14px; border-radius: 10px; border: 1px solid #334155; }}
    .action-box {{ background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 14px; margin-top: 20px; }}
    .action-title {{ color: #34d399; font-weight: bold; font-size: 13px; margin-bottom: 4px; }}
    .action-desc {{ color: #a7f3d0; font-size: 13px; margin: 0; line-height: 1.4; }}
    .footer {{ background-color: #0f172a; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CRITICAL SAFETY ALERT</h1>
      <p>High-Risk Workplace Hazard Detected & Escalated</p>
    </div>
    <div class="content">
      <table width="100%" style="margin-bottom: 16px;">
        <tr>
          <td><span class="badge badge-code">Incident Code: {incident_code}</span></td>
          <td align="right"><span class="badge badge-risk">Severity: {severity} ({risk_score}/100 Risk)</span></td>
        </tr>
      </table>

      <div class="section">
        <div class="section-title">Facility Location</div>
        <div class="section-body"><strong>{location}</strong> (Reported by: {reporter})</div>
      </div>

      <div class="section">
        <div class="section-title">Hazard Category & Description</div>
        <div class="section-body">
          <strong style="color: #38bdf8;">[{category}]</strong> {desc}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Matched Safety Compliance Standard</div>
        <div class="section-body" style="border-left: 3px solid #ef4444;">
          <strong>{rule_title}</strong>
        </div>
      </div>

      <div class="action-box">
        <div class="action-title">Recommended Immediate Corrective Action:</div>
        <p class="action-desc">{corrective_action}</p>
      </div>
    </div>
    <div class="footer">
      Autonomously orchestrated & dispatched by <strong>Workplace SafetyWatch Multi-Agent AI Pipeline</strong>.<br/>
      Please log in to the Manager Portal to triage and assign remediation responsibility.
    </div>
  </div>
</body>
</html>
"""
    return html

def send_incident_notification_email(
    incident: Dict[str, Any],
    recipient: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends real email via SMTP (e.g. Gmail / Outlook / Custom SMTP) to harinirajasekaran2004@gmail.com.
    """
    to_email = recipient or DEFAULT_MANAGER_EMAIL
    incident_code = incident.get("incident_code", "WS-1024")
    severity = incident.get("severity", "High")
    location = incident.get("location", "Facility")
    
    subject = f"[CRITICAL SAFETY ALERT] {severity.upper()} Hazard Detected: {incident_code} at {location}"
    html_content = generate_html_alert(incident)
    
    plain_text = f"""
======================================================
WORKPLACE SAFETYWATCH — CRITICAL HAZARD ALERT
======================================================
Incident Code: {incident_code}
Severity: {severity} ({incident.get('risk_score', 88)}/100 Risk Score)
Location: {location}
Category: {incident.get('category', 'General')}
Reported by: {incident.get('reporter_name', 'Employee')}

Description:
{incident.get('description', 'Hazard detected.')}

Immediate Action Required:
Inspect and de-energize/clear the hazard area immediately.
======================================================
"""

    status = "simulated"
    sent_at = datetime.now(timezone.utc).isoformat()
    error_message = None

    # Check if real SMTP credentials are provided in settings / .env
    smtp_user = settings.SMTP_USER.strip()
    smtp_password = settings.SMTP_PASSWORD.strip()

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{settings.SMTP_FROM_NAME} <{smtp_user}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(plain_text, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [to_email], msg.as_string())
            server.quit()

            status = "actually sent"
            logger.info(f"REAL email successfully delivered to {to_email} via {settings.SMTP_HOST}")
        except Exception as e:
            logger.error(f"Failed to deliver real email via SMTP: {e}")
            status = "failed"
            error_message = str(e)
    else:
        logger.info(f"SMTP credentials not provided in .env; recording simulated dispatch to {to_email}")
        status = "simulated"

    return {
        "recipient": to_email,
        "channel": "email",
        "status": status,
        "sent_at": sent_at,
        "subject": subject,
        "message": plain_text,
        "error": error_message,
        "smtp_configured": bool(smtp_user and smtp_password)
    }
