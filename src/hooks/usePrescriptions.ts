
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Prescription {
  id: string;
  doctor_name: string;
  patient_name: string;
  age: number;
  gender: string;
  contact: string | null;
  temperature: number | null;
  bp: string | null;
  medications: any[];
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisData {
  id: string;
  prescription_id: string;
  drug_interactions: any[];
  adverse_reactions: any[];
  dosage_validation: any[];
  overall_risk: string | null;
  recommendations: any[];
  alternatives: any[];
  medication_resolutions: any[];
  created_at: string;
}

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPrescriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our interface types
      const typedData: Prescription[] = (data || []).map(item => ({
        ...item,
        medications: Array.isArray(item.medications) ? item.medications : []
      }));
      
      setPrescriptions(typedData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrescription = async (prescriptionData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
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
          notes: prescriptionData.notes,
          follow_up_date: prescriptionData.followUpDate || null
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchPrescriptions();
      return data;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  };

  const saveAIAnalysis = async (prescriptionId: string, analysisData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('ai_analysis')
        .insert({
          prescription_id: prescriptionId,
          drug_interactions: analysisData.drugInteractions || [],
          adverse_reactions: analysisData.adverseReactions || [],
          dosage_validation: analysisData.dosageValidation || [],
          overall_risk: analysisData.overallRisk,
          recommendations: analysisData.recommendations || [],
          alternatives: analysisData.alternatives || [],
          medication_resolutions: analysisData.medicationResolutions || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving AI analysis:', error);
      throw error;
    }
  };

  const getAIAnalysis = async (prescriptionId: string): Promise<AIAnalysisData | null> => {
    try {
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      // Cast the data to match our interface types
      const typedData: AIAnalysisData = {
        ...data,
        drug_interactions: Array.isArray(data.drug_interactions) ? data.drug_interactions : [],
        adverse_reactions: Array.isArray(data.adverse_reactions) ? data.adverse_reactions : [],
        dosage_validation: Array.isArray(data.dosage_validation) ? data.dosage_validation : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
        medication_resolutions: Array.isArray(data.medication_resolutions) ? data.medication_resolutions : []
      };
      
      return typedData;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  return {
    prescriptions,
    loading,
    savePrescription,
    saveAIAnalysis,
    getAIAnalysis,
    fetchPrescriptions
  };
};
