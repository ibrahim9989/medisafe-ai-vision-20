
import React from 'react';
import { PrescriptionData } from './PrescriptionForm';
import MobileFriendlyPDFExport from './MobileFriendlyPDFExport';

interface PDFExportProps {
  prescriptionData: PrescriptionData;
  analysis: any;
}

const PDFExport = ({ prescriptionData, analysis }: PDFExportProps) => {
  return <MobileFriendlyPDFExport prescriptionData={prescriptionData} analysis={analysis} />;
};

export default PDFExport;
