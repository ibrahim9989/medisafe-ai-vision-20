
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
  notes: string | null;
  consultation_notes: string | null;
  recommended_tests: string[];
  lab_reports: any[];
  lab_analysis: string | null;
  follow_up_date: string | null;
  is_follow_up: boolean;
  original_prescription_id: string | null;
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
    data: prescriptions,
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

      if (error) throw error;
      
      // Transform the data to match our interface
      return data.map(prescription => ({
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

      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          doctor_name: prescriptionData.doctorName,
          patient_name: prescriptionData.patientName,
          age: prescriptionData.age,
          gender: prescriptionData.gender,
          contact: prescriptionData.contact,
          temperature: prescriptionData.temperature,
          bp: prescriptionData.bp,
          medications: prescriptionData.medications,
          diagnosis: prescriptionData.diagnosis,
          notes: prescriptionData.notes,
          consultation_notes: prescriptionData.consultationNotes,
          recommended_tests: prescriptionData.recommendedTests,
          lab_reports: prescriptionData.labReports.map(file => ({ name: file.name, size: file.size, type: file.type })),
          lab_analysis: prescriptionData.labAnalysis,
          follow_up_date: prescriptionData.followUpDate,
          is_follow_up: prescriptionData.isFollowUp,
          original_prescription_id: prescriptionData.originalPrescriptionId
        })
        .select()
        .single();

      if (error) throw error;

      // If this is a follow-up prescription, create the relationship
      if (prescriptionData.isFollowUp && prescriptionData.originalPrescriptionId) {
        const { error: followUpError } = await supabase
          .from('follow_up_prescriptions')
          .insert({
            original_prescription_id: prescriptionData.originalPrescriptionId,
            follow_up_prescription_id: data.id,
            notes: `Follow-up prescription created on ${new Date().toISOString()}`
          });

        if (followUpError) {
          console.error('Error creating follow-up relationship:', followUpError);
        }
      }

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
          user_id: user.id,
          analysis: analysis.analysis,
          risk_factors: analysis.risk_factors,
          recommendations: analysis.recommendations,
          drug_interactions: analysis.drug_interactions,
          alternative_treatments: analysis.alternative_treatments,
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
    prescriptions: prescriptions || [],
    isLoading,
    error,
    savePrescription: savePrescriptionMutation.mutateAsync,
    saveAIAnalysis: saveAIAnalysisMutation.mutateAsync,
    getFollowUpPrescriptions,
  };
};
