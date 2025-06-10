
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { toast } from '@/hooks/use-toast';

export interface PatientHistoryData {
  patient: any;
  visits: any[];
  prescriptions: any[];
  lastVisit: any;
  totalVisits: number;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: any[];
}

export const usePatientHistory = () => {
  const [patientHistory, setPatientHistory] = useState<PatientHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useDoctorProfile();

  const searchPatient = async (searchTerm: string) => {
    if (!profile || !searchTerm.trim()) return null;

    setLoading(true);
    try {
      // Search by name or phone number with fuzzy matching
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', profile.id)
        .or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`);

      if (error) throw error;

      return patients || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Search Error",
        description: "Failed to search patients",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPatientHistory = async (patientId: string) => {
    if (!profile) return null;

    setLoading(true);
    try {
      // Get patient details
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Get all visits for this patient
      const { data: visits, error: visitsError } = await supabase
        .from('patient_visits')
        .select(`
          *,
          prescriptions (*)
        `)
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Get all prescriptions for this patient
      const prescriptionIds = visits
        .filter(visit => visit.prescription_id)
        .map(visit => visit.prescription_id);

      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .in('id', prescriptionIds);

      if (prescriptionsError) throw prescriptionsError;

      // Analyze history
      const lastVisit = visits[0];
      const totalVisits = visits.length;
      
      // Extract chronic conditions from previous diagnoses
      const chronicConditions = [...new Set(
        visits
          .filter(visit => visit.diagnosis)
          .map(visit => visit.diagnosis)
          .filter(diagnosis => 
            diagnosis.toLowerCase().includes('diabetes') ||
            diagnosis.toLowerCase().includes('hypertension') ||
            diagnosis.toLowerCase().includes('chronic') ||
            diagnosis.toLowerCase().includes('asthma')
          )
      )];

      // Get current medications from most recent prescription - fix the type issue
      let currentMedications: any[] = [];
      if (lastVisit?.prescriptions?.medications) {
        const meds = lastVisit.prescriptions.medications;
        // Ensure medications is always treated as an array
        currentMedications = Array.isArray(meds) ? meds : [];
      }

      const historyData: PatientHistoryData = {
        patient,
        visits: visits || [],
        prescriptions: prescriptions || [],
        lastVisit,
        totalVisits,
        chronicConditions,
        allergies: [], // This could be extracted from notes in future
        currentMedications
      };

      setPatientHistory(historyData);
      return historyData;
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient history",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePatientInfo = async (patientId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });

      // Refresh patient history
      await getPatientHistory(patientId);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive"
      });
    }
  };

  return {
    patientHistory,
    loading,
    searchPatient,
    getPatientHistory,
    updatePatientInfo,
    clearHistory: () => setPatientHistory(null)
  };
};
