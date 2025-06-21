
export interface PrescriptionData {
  doctorName: string;
  patientName: string;
  age: number;
  gender: string;
  contact: string;
  temperature: number | null;
  bp: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  diagnosis: string;
  notes: string;
  consultationNotes: string;
  recommendedTests: string[];
  labReports: File[];
  labAnalysis: string;
  followUpDate: string;
  isFollowUp: boolean;
  originalPrescriptionId?: string;
}

export interface FollowUpPrescription {
  id: string;
  original_prescription_id: string;
  follow_up_prescription_id: string;
  notes: string;
  created_at: string;
}
