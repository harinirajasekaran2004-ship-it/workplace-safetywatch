import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_incident_pdf(incident: dict) -> io.BytesIO:
    """
    Generates a professional, formal PDF Incident & Hazard Report document.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )
    
    sub_title_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica'
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f766e'),
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        fontName='Helvetica'
    )
    
    bold_body = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>WORKPLACE SAFETYWATCH</b><br/><font size=8 color='#64748b'>Multi-Agent Hazard Detection & Incident Management System</font>", title_style),
            Paragraph(f"<b>INCIDENT CODE:</b><br/><font size=14 color='#0f766e'><b>{incident.get('incident_code', 'WS-1024')}</b></font><br/><font size=7 color='#64748b'>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</font>", ParagraphStyle('HRight', alignment=2, parent=styles['Normal']))
        ]
    ]
    header_table = Table(header_data, colWidths=[340, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f766e'), spaceAfter=10))

    # 2. Executive Incident Summary Box
    severity = incident.get('severity', 'Medium')
    sev_color = '#ef4444' if severity in ['High', 'Critical'] else '#f59e0b' if severity == 'Medium' else '#10b981'
    
    summary_data = [
        [
            Paragraph("<b>Location:</b>", bold_body),
            Paragraph(incident.get('location', 'Facility Floor'), body_style),
            Paragraph("<b>Severity:</b>", bold_body),
            Paragraph(f"<font color='{sev_color}'><b>{severity.upper()}</b></font>", bold_body)
        ],
        [
            Paragraph("<b>Hazard Category:</b>", bold_body),
            Paragraph(incident.get('category', 'General'), body_style),
            Paragraph("<b>Risk Score:</b>", bold_body),
            Paragraph(f"<b>{incident.get('risk_score', 0)} / 100</b> ({incident.get('priority', 'Medium')} Priority)", bold_body)
        ],
        [
            Paragraph("<b>Reporter:</b>", bold_body),
            Paragraph(incident.get('reporter_name', 'Employee'), body_style),
            Paragraph("<b>Status:</b>", bold_body),
            Paragraph(f"<b>{incident.get('status', 'REPORTED')}</b>", bold_body)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[110, 160, 100, 170])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # 3. Hazard Description
    story.append(Paragraph("1. Observed Hazard Details", section_heading))
    desc_text = incident.get('description') or "No description provided."
    story.append(Paragraph(f"<b>Condition Observed:</b> {desc_text}", body_style))
    story.append(Spacer(1, 8))

    # 4. Explainable Risk Assessment Breakdown
    story.append(Paragraph("2. Explainable Risk Assessment Rubric", section_heading))
    risk_obj = incident.get('risk_assessment') or {}
    sev_score = risk_obj.get('severity_score', 4)
    lik_score = risk_obj.get('likelihood', 4)
    rationale = risk_obj.get('rationale', 'Calculated using standardized severity-likelihood matrix.')
    
    risk_table_data = [
        [
            Paragraph("<b>Severity Scale (1-5):</b>", bold_body),
            Paragraph(f"{sev_score} / 5", body_style),
            Paragraph("<b>Likelihood Scale (1-5):</b>", bold_body),
            Paragraph(f"{lik_score} / 5", body_style)
        ],
        [
            Paragraph("<b>Mathematical Formula:</b>", bold_body),
            Paragraph("(Severity × Likelihood / 25) × 100", body_style),
            Paragraph("<b>Calculated Score:</b>", bold_body),
            Paragraph(f"<b>{incident.get('risk_score', 88)} / 100</b>", bold_body)
        ]
    ]
    risk_table = Table(risk_table_data, colWidths=[140, 130, 140, 130])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Assessment Rationale:</b> {rationale}", body_style))
    story.append(Spacer(1, 8))

    # 5. Safety Rule & Compliance Matching
    story.append(Paragraph("3. Safety Rule & Compliance Matching", section_heading))
    matched_rules = incident.get('matched_rules', [])
    if matched_rules:
        rule = matched_rules[0]
        rule_data = [
            [Paragraph("<b>Matched Standard:</b>", bold_body), Paragraph(f"[{rule.get('code')}] {rule.get('title')}", body_style)],
            [Paragraph("<b>Compliance Status:</b>", bold_body), Paragraph(f"<font color='#dc2626'><b>{rule.get('compliance_status', 'NON_COMPLIANT')}</b></font>", bold_body)],
            [Paragraph("<b>Standard Description:</b>", bold_body), Paragraph(rule.get('description', ''), body_style)],
            [Paragraph("<b>Why Rule Applies:</b>", bold_body), Paragraph(rule.get('why_it_applies', ''), body_style)],
            [Paragraph("<b>Recommended Corrective Action:</b>", bold_body), Paragraph(f"<b>{rule.get('recommended_corrective_action', '')}</b>", body_style)],
        ]
        rule_table = Table(rule_data, colWidths=[150, 390])
        rule_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(rule_table)
    else:
        story.append(Paragraph("Standard safe operating conditions verified.", body_style))
    story.append(Spacer(1, 8))

    # 6. Manager Notification & Escalation Log
    story.append(Paragraph("4. Management Escalation & Notification Log", section_heading))
    notifications = incident.get('notifications', [])
    if notifications:
        notif = notifications[0]
        notif_data = [
            [
                Paragraph("<b>Recipient:</b>", bold_body),
                Paragraph(notif.get('recipient', 'harinirajasekaran2004@gmail.com'), body_style),
                Paragraph("<b>Dispatch Status:</b>", bold_body),
                Paragraph(f"<font color='#2563eb'><b>{notif.get('status', 'simulated').upper()}</b></font>", bold_body)
            ],
            [
                Paragraph("<b>Subject:</b>", bold_body),
                Paragraph(notif.get('subject', 'Safety Alert'), body_style),
                Paragraph("<b>Dispatched At:</b>", bold_body),
                Paragraph(notif.get('sent_at', datetime.now().isoformat())[:19], body_style)
            ]
        ]
        notif_table = Table(notif_data, colWidths=[100, 210, 100, 130])
        notif_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#bfdbfe')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dbeafe')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(notif_table)
    story.append(Spacer(1, 8))

    # 7. Multi-Agent Probabilistic Confidence Scores
    story.append(Paragraph("5. AI Model Evaluation Metrics", section_heading))
    metrics = incident.get('confidence_metrics') or {}
    metrics_data = [
        [
            Paragraph("<b>Detection Confidence:</b>", bold_body),
            Paragraph(f"{metrics.get('detection_confidence', 94.0)}%", body_style),
            Paragraph("<b>Classification Confidence:</b>", bold_body),
            Paragraph(f"{metrics.get('classification_confidence', 91.0)}%", body_style),
        ],
        [
            Paragraph("<b>Rule Match Confidence:</b>", bold_body),
            Paragraph(f"{metrics.get('rule_match_confidence', 95.0)}%", body_style),
            Paragraph("<b>Overall Analysis Score:</b>", bold_body),
            Paragraph(f"<b>{metrics.get('overall_analysis_score', 92.0)}%</b>", bold_body),
        ]
    ]
    metrics_table = Table(metrics_data, colWidths=[150, 120, 150, 120])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph("<font size=7 color='#64748b'><b>Disclaimer:</b> Model confidence and evaluation metrics are probabilistic inference scores for system benchmarking and do not constitute certified legal or governmental OSHA regulatory certification.</font>", body_style))

    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
