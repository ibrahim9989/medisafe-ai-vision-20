
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Download } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import jsPDF from 'jspdf';

interface PrescriptionPDFExportProps {
  prescriptionData: PrescriptionData;
}

const PrescriptionPDFExport = ({ prescriptionData }: PrescriptionPDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useIsMobile();

  const generatePrescriptionPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('PRESCRIPTION', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Medical Prescription Document', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 3;

      // Doctor Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Doctor Information', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Dr. ${prescriptionData.doctorName}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Patient Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Patient Information', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const patientInfo = [
        `Patient Name: ${prescriptionData.patientName}`,
        `Age: ${prescriptionData.age} years`,
        `Gender: ${prescriptionData.gender}`,
        `Contact: ${prescriptionData.contact || 'N/A'}`,
        `Temperature: ${prescriptionData.temperature}°F`,
        `Blood Pressure: ${prescriptionData.bp}`
      ];

      patientInfo.forEach(info => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(info, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Diagnosis
      if (prescriptionData.diagnosis) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Diagnosis', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(prescriptionData.diagnosis, margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Medications
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Prescribed Medications', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      prescriptionData.medications.forEach((med, index) => {
        if (yPosition > pageHeight - margin * 3) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`${index + 1}. ${med.name}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`   Dosage: ${med.dosage}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`   Frequency: ${med.frequency}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`   Duration: ${med.duration}`, margin + 5, yPosition);
        yPosition += lineHeight * 1.5;
      });

      // Notes
      if (prescriptionData.notes) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Clinical Notes', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(prescriptionData.notes, margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Follow-up
      if (prescriptionData.followUpDate) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Follow-up Date: ${prescriptionData.followUpDate}`, margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Signature area
      if (yPosition > pageHeight - margin * 4) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Doctor Signature: ___________________', margin, pageHeight - margin * 2);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 80, pageHeight - margin * 2);

      return doc;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = await generatePrescriptionPDF();
      doc.save(`prescription-${prescriptionData.patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Prescription Downloaded",
        description: "Prescription has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate prescription PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className={`${isMobile ? 'text-sm py-2 px-3' : ''} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download Prescription'}
    </Button>
  );
};

export default PrescriptionPDFExport;
