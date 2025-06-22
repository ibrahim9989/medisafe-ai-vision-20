
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PrescriptionData } from '@/types/prescription';

export interface Prescription {
  id: string;
  user_id: string;
  doctor_name: string;
  patient_name: string;
  age: number;
  gender: string;
  contact: string | null;
  temperature: number | null;
  bp: string | null;
  medications: any[];
  diagnosis: string | null;
  diagnosis_details: string | null;
  underlying_conditions: string | null;
  notes: string | null;
  consultation_notes: string | null;
  recommended_tests: string[];
  lab_reports: any[];
  lab_analysis: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  prescriptionId: string;
  analysis: string;
  riskFactors: string[];
  recommendations: string[];
  drugInteractions: string[];
  alternativeTreatments: string[];
  created_at: string;
}

export const usePrescriptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: prescriptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
      }
      
      return (data || []).map(prescription => ({
        ...prescription,
        recommended_tests: Array.isArray(prescription.recommended_tests) 
          ? prescription.recommended_tests.map(String) 
          : []
      })) as Prescription[];
    },
    enabled: !!user,
  });

  const savePrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: PrescriptionData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('💾 Saving prescription with data:', prescriptionData);
      console.log('🔬 Lab analysis to save:', prescriptionData.labAnalysis ? 'Present' : 'Missing');

      const prescriptionToSave = {
        user_id: user.id,
        doctor_name: prescriptionData.doctorName,
        patient_name: prescriptionData.patientName,
        age: prescriptionData.age,
        gender: prescriptionData.gender,
        contact: prescriptionData.contact || null,
        temperature: prescriptionData.temperature,
        bp: prescriptionData.bp,
        medications: prescriptionData.medications,
        diagnosis: prescriptionData.diagnosis,
        diagnosis_details: prescriptionData.diagnosisDetails || null,
        underlying_conditions: prescriptionData.underlyingConditions || null,
        notes: prescriptionData.notes,
        consultation_notes: prescriptionData.consultationNotes,
        recommended_tests: prescriptionData.recommendedTests,
        lab_reports: prescriptionData.labReports.map(file => ({ 
          name: file.name, 
          size: file.size, 
          type: file.type 
        })),
        lab_analysis: prescriptionData.labAnalysis || null,
        follow_up_date: prescriptionData.followUpDate || null
      };

      console.log('🚀 Sending to database:', {
        ...prescriptionToSave,
        lab_analysis: prescriptionToSave.lab_analysis ? `${prescriptionToSave.lab_analysis.length} characters` : 'null'
      });

      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionToSave)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving prescription:', error);
        throw error;
      }

      console.log('✅ Prescription saved successfully with all fields');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  const saveAIAnalysisMutation = useMutation({
    mutationFn: async ({ prescriptionId, analysis }: { prescriptionId: string; analysis: any }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_analysis')
        .insert({
          prescription_id: prescriptionId,
          overall_risk: analysis.analysis,
          drug_interactions: analysis.drug_interactions,
          recommendations: analysis.recommendations,
          alternatives: analysis.alternative_treatments,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  const getFollowUpPrescriptions = async (originalPrescriptionId: string) => {
    const { data, error } = await supabase
      .from('follow_up_prescriptions')
      .select(`
        *,
        follow_up_prescription:prescriptions!follow_up_prescriptions_follow_up_prescription_id_fkey(*)
      `)
      .eq('original_prescription_id', originalPrescriptionId);

    if (error) throw error;
    return data;
  };

  return {
    prescriptions,
    isLoading,
    error,
    savePrescription: savePrescriptionMutation.mutateAsync,
    saveAIAnalysis: saveAIAnalysisMutation.mutateAsync,
    getFollowUpPrescriptions,
  };
};
