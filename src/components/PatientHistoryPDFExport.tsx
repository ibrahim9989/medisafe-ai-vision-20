
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface PatientHistoryPDFExportProps {
  visit: any;
  patient: any;
  prescription?: any;
}

const PatientHistoryPDFExport = ({ visit, patient, prescription }: PatientHistoryPDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHistoryPDF = async () => {
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
      doc.text('PATIENT VISIT RECORD', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Historical Medical Record', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 3;

      // Patient Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Patient Information', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const patientInfo = [
        `Patient Name: ${patient.full_name}`,
        `Patient ID: ${patient.patient_id}`,
        `Age: ${patient.age || 'N/A'} years`,
        `Gender: ${patient.gender || 'N/A'}`,
        `Contact: ${patient.phone_number || 'N/A'}`
      ];

      patientInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Visit Details
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Visit Details', margin, yPosition);
      yPosition += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const visitInfo = [
        `Visit Date: ${new Date(visit.visit_date).toLocaleDateString()}`,
        `Reason for Visit: ${visit.reason_for_visit || 'General consultation'}`,
        `Diagnosis: ${visit.diagnosis || 'N/A'}`,
        `Visit ID: ${visit.id}`
      ];

      visitInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Prescription Details (if available)
      if (prescription && prescription.medications) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Prescribed Medications', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        prescription.medications.forEach((med: any, index: number) => {
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

        yPosition += lineHeight;

        // Vital Signs (if available)
        if (prescription.temperature || prescription.bp) {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Vital Signs', margin, yPosition);
          yPosition += lineHeight * 1.5;

          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          if (prescription.temperature) {
            doc.text(`Temperature: ${prescription.temperature}°F`, margin, yPosition);
            yPosition += lineHeight;
          }
          if (prescription.bp) {
            doc.text(`Blood Pressure: ${prescription.bp}`, margin, yPosition);
            yPosition += lineHeight;
          }
          yPosition += lineHeight;
        }
      }

      // Clinical Notes
      if (visit.notes) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Clinical Notes', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(visit.notes, margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Footer
      if (yPosition > pageHeight - margin * 3) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - margin);
      doc.text('This is a historical medical record.', margin, pageHeight - margin + 5);

      return doc;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = await generateHistoryPDF();
      const fileName = `visit-record-${patient.full_name.replace(/\s+/g, '-')}-${visit.visit_date}.pdf`;
      doc.save(fileName);
      toast({
        title: "Visit Record Downloaded",
        description: "Patient visit record has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate visit record PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="bg-white/60 border-white/30 hover:bg-blue-50"
    >
      <FileDown className="h-3 w-3 mr-1" />
      {isGenerating ? 'Generating...' : 'PDF'}
    </Button>
  );
};

export default PatientHistoryPDFExport;
