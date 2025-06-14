
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Brain } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import jsPDF from 'jspdf';

interface AIAnalysisPDFExportProps {
  prescriptionData: PrescriptionData;
  analysis: any;
}

const AIAnalysisPDFExport = ({ prescriptionData, analysis }: AIAnalysisPDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useIsMobile();

  const generateAnalysisPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('AI ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('AI-Powered Medical Safety Assessment', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 3;

      // Patient Reference
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Patient: ${prescriptionData.patientName} | Age: ${prescriptionData.age} | Gender: ${prescriptionData.gender}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Overall Risk Assessment
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Overall Risk Assessment', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const riskColor = analysis.overallRisk === 'High' ? [220, 38, 38] : 
                       analysis.overallRisk === 'Medium' ? [217, 119, 6] : [22, 163, 74];
      doc.setTextColor(...riskColor);
      doc.text(`Risk Level: ${analysis.overallRisk}`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += lineHeight * 2;

      // Drug Interactions
      if (analysis.drugInteractions && analysis.drugInteractions.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Drug Interactions', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        analysis.drugInteractions.forEach((interaction: any, index: number) => {
          if (yPosition > pageHeight - margin * 4) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${interaction.medications.join(' + ')} - ${interaction.severity}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`   ${interaction.description}`, margin + 5, yPosition);
          yPosition += lineHeight * 1.5;
        });
        yPosition += lineHeight;
      }

      // Adverse Reactions
      if (analysis.adverseReactions && analysis.adverseReactions.length > 0) {
        if (yPosition > pageHeight - margin * 6) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Potential Adverse Reactions', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        analysis.adverseReactions.forEach((reaction: any, index: number) => {
          if (yPosition > pageHeight - margin * 4) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${reaction.medication}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`   Reaction: ${reaction.reaction}`, margin + 5, yPosition);
          yPosition += lineHeight;
          doc.text(`   Likelihood: ${reaction.likelihood}`, margin + 5, yPosition);
          yPosition += lineHeight * 1.5;
        });
        yPosition += lineHeight;
      }

      // Alternative Medications
      if (analysis.alternatives && analysis.alternatives.length > 0) {
        if (yPosition > pageHeight - margin * 6) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Alternative Medications', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        analysis.alternatives.forEach((alt: any, index: number) => {
          if (yPosition > pageHeight - margin * 4) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. For ${alt.originalMedication} (${alt.riskLevel} risk):`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`   Alternatives: ${alt.alternativeMedicines.join(', ')}`, margin + 5, yPosition);
          yPosition += lineHeight;
          doc.text(`   Reasoning: ${alt.reasoning}`, margin + 5, yPosition);
          yPosition += lineHeight * 1.5;
        });
        yPosition += lineHeight;
      }

      // Recommendations
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        if (yPosition > pageHeight - margin * 6) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Clinical Recommendations', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        analysis.recommendations.forEach((rec: string, index: number) => {
          if (yPosition > pageHeight - margin * 2) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${rec}`, margin, yPosition);
          yPosition += lineHeight * 1.2;
        });
      }

      // Footer
      if (yPosition > pageHeight - margin * 3) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - margin);
      doc.text('This AI analysis should be reviewed by a qualified healthcare professional.', margin, pageHeight - margin + 5);

      return doc;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = await generateAnalysisPDF();
      doc.save(`ai-analysis-${prescriptionData.patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "AI Analysis Downloaded",
        description: "AI analysis report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate AI analysis PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className={`${isMobile ? 'text-sm py-2 px-3' : ''} bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <Brain className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download AI Analysis'}
    </Button>
  );
};

export default AIAnalysisPDFExport;
