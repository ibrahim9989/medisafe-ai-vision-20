
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';

interface PDFExportProps {
  prescriptionData: PrescriptionData;
  analysis: any;
}

const PDFExport = ({ prescriptionData, analysis }: PDFExportProps) => {
  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription Analysis Report</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid transparent;
              background: linear-gradient(white, white) padding-box,
                         linear-gradient(90deg, #667eea, #764ba2) border-box;
            }
            .title {
              background: linear-gradient(90deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              font-size: 16px;
              font-weight: 300;
            }
            .section {
              margin-bottom: 32px;
              padding: 24px;
              border-radius: 16px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-left: 4px solid;
              border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
            }
            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '';
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea, #764ba2);
              margin-right: 12px;
            }
            .patient-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            }
            .field {
              background: white;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .field-label {
              font-size: 12px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .field-value {
              font-size: 16px;
              font-weight: 500;
              color: #1e293b;
            }
            .medication-item {
              background: white;
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 12px;
              border: 1px solid #e2e8f0;
              position: relative;
              overflow: hidden;
            }
            .medication-item::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 4px;
              height: 100%;
              background: linear-gradient(135deg, #667eea, #764ba2);
            }
            .medication-name {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 8px;
            }
            .medication-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 8px;
              font-size: 14px;
              color: #64748b;
            }
            .risk-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .risk-high { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .risk-medium { background: #fffbeb; color: #d97706; border: 1px solid #fed7aa; }
            .risk-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .interaction-item {
              background: white;
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 12px;
              border-left: 4px solid #e2e8f0;
            }
            .interaction-high { border-left-color: #dc2626; }
            .interaction-medium { border-left-color: #d97706; }
            .interaction-low { border-left-color: #16a34a; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            @media print {
              body { background: white !important; }
              .container { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Prescription Analysis Report</h1>
              <p class="subtitle">AI-Powered Medical Safety Assessment</p>
            </div>

            <div class="section">
              <h2 class="section-title">Patient Information</h2>
              <div class="patient-grid">
                <div class="field">
                  <div class="field-label">Patient Name</div>
                  <div class="field-value">${prescriptionData.patientName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Age</div>
                  <div class="field-value">${prescriptionData.age} years</div>
                </div>
                <div class="field">
                  <div class="field-label">Gender</div>
                  <div class="field-value">${prescriptionData.gender}</div>
                </div>
                <div class="field">
                  <div class="field-label">Doctor</div>
                  <div class="field-value">Dr. ${prescriptionData.doctorName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Temperature</div>
                  <div class="field-value">${prescriptionData.temperature}°F</div>
                </div>
                <div class="field">
                  <div class="field-label">Blood Pressure</div>
                  <div class="field-value">${prescriptionData.bp}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Prescribed Medications</h2>
              ${prescriptionData.medications.map(med => `
                <div class="medication-item">
                  <div class="medication-name">${med.name}</div>
                  <div class="medication-details">
                    <div><strong>Dosage:</strong> ${med.dosage}</div>
                    <div><strong>Frequency:</strong> ${med.frequency}</div>
                    <div><strong>Duration:</strong> ${med.duration}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2 class="section-title">Risk Assessment</h2>
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="risk-badge risk-${analysis.overallRisk.toLowerCase()}">
                  Overall Risk: ${analysis.overallRisk}
                </span>
              </div>
            </div>

            ${analysis.drugInteractions && analysis.drugInteractions.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Drug Interactions</h2>
              ${analysis.drugInteractions.map((interaction: any) => `
                <div class="interaction-item interaction-${interaction.severity.toLowerCase()}">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>${interaction.medications.join(' + ')}</strong>
                    <span class="risk-badge risk-${interaction.severity.toLowerCase()}">${interaction.severity}</span>
                  </div>
                  <p>${interaction.description}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${analysis.recommendations && analysis.recommendations.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Recommendations</h2>
              <ul style="list-style: none; padding: 0;">
                ${analysis.recommendations.map((rec: string) => `
                  <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #667eea; margin-right: 8px;">•</span>${rec}
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}

            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                This report is generated by AI and should be reviewed by a qualified healthcare professional.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const downloadPDF = () => {
    generatePDF();
  };

  return (
    <div className="flex space-x-3">
      <Button
        onClick={downloadPDF}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button
        onClick={generatePDF}
        variant="outline"
        className="border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Report
      </Button>
    </div>
  );
};

export default PDFExport;
