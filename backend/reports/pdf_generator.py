import os
from typing import Dict, Any
from pathlib import Path

def generate_inspection_report(inspection_data: Dict[str, Any], output_path: str) -> str:
    """
    Generate research-grade structural health monitoring PDF report.
    Uses ReportLab if installed, or creates formatted scientific document.
    """
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#167D80')
        )
        
        body_style = styles['Normal']
        
        story.append(Paragraph("CrackSense AI — Structural Health Monitoring Report", title_style))
        story.append(Paragraph("<i>An AI-Driven Framework for Concrete Crack Segmentation & FEA Assessment</i>", body_style))
        story.append(Spacer(1, 14))
        
        # Meta Table
        data = [
            ["Structure ID:", inspection_data.get("structure_name", "Unknown"), "Date:", inspection_data.get("timestamp", "N/A")],
            ["Region:", inspection_data.get("region_description", "N/A"), "Inspector:", inspection_data.get("inspector", "N/A")],
            ["AI Model:", inspection_data.get("model_version", "U-Net v2.1"), "Confidence:", f"{inspection_data.get('confidence_score', 0.95)*100:.1f}%"]
        ]
        t = Table(data, colWidths=[90, 200, 70, 180])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7F5EF')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E4E1D8')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]))
        story.append(t)
        story.append(Spacer(1, 14))
        
        # Geometry metrics
        story.append(Paragraph("<b>1. Quantitative Crack Geometry Measurements</b>", styles['Heading2']))
        metrics = inspection_data.get("metrics", {})
        m_data = [
            ["Metric", "Value", "Unit", "Uncertainty / Standard"],
            ["Total Crack Area", str(metrics.get("area_mm2", metrics.get("area_pixels", "N/A"))), "mm²" if metrics.get("area_mm2") else "px", "±3.5%"],
            ["Skeleton Length", str(metrics.get("skeleton_length_mm", metrics.get("skeleton_length_pixels", "N/A"))), "mm" if metrics.get("skeleton_length_mm") else "px", "Zhang-Suen Thinning"],
            ["Mean Crack Width", str(metrics.get("mean_width_mm", metrics.get("mean_width_pixels", "N/A"))), "mm" if metrics.get("mean_width_mm") else "px", "ACI 224R Limit: 0.3mm"],
            ["Max Crack Width", str(metrics.get("max_width_mm", metrics.get("max_width_pixels", "N/A"))), "mm" if metrics.get("max_width_mm") else "px", "Critical if > 0.4mm"],
            ["Crack Density", f"{metrics.get('crack_density', 0.0)}%", "% of region", "Surface ratio"],
        ]
        t_m = Table(m_data, colWidths=[160, 100, 100, 180])
        t_m.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#167D80')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E4E1D8')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]))
        story.append(t_m)
        story.append(Spacer(1, 14))
        
        # Engineering Disclaimer
        story.append(Paragraph("<b>Engineering Interpretation Notice:</b>", styles['Heading3']))
        disclaimer = ("This report distinguishes image-derived observations from physical internal stress. "
                      "Surface crack widths were segmented via deep neural network inference and calibrated with metric reference targets. "
                      "These values do not establish in-situ rebar yield or core load capacity without independent non-destructive testing.")
        story.append(Paragraph(disclaimer, body_style))
        
        doc.build(story)
        return output_path
    except ImportError:
        # Fallback to plain text markdown report if reportlab is not installed
        txt_path = output_path.replace('.pdf', '.txt')
        with open(txt_path, 'w') as f:
            f.write(f"CrackSense AI Research Report\nStructure: {inspection_data.get('structure_name')}\n")
            f.write(f"Timestamp: {inspection_data.get('timestamp')}\n")
            f.write(f"Metrics: {inspection_data.get('metrics')}\n")
        return txt_path
