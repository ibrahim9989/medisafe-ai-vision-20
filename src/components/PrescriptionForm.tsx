
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { supabase } from '@/integrations/supabase/client';
import EnhancedPrescriptionForm from './EnhancedPrescriptionForm';
import ConsultationNotesSection from './ConsultationNotesSection';
import RecommendedTestsSection from './RecommendedTestsSection';
import LabReportsSection from './LabReportsSection';
import FollowUpSection from './FollowUpSection';
import VitalSigns from './VitalSigns';
import EnhancedMedicationList from './EnhancedMedicationList';
import ConsultationRecorder from './ConsultationRecorder';
import AIAnalysisSection from './AIAnalysisSection';
import { PrescriptionData } from '@/types/prescription';

const PrescriptionForm = () => {
  const { user } = useAuth();
  const { profile } = useDoctorProfile();
  const { savePrescription, saveAIAnalysis } = usePrescriptions();

  const [data, setData] = useState<PrescriptionData>({
    doctorName: '',
    patientName: '',
    age: 0,
    gender: '',
    contact: '',
    temperature: null,
    bp: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    diagnosis: '',
    notes: '',
    consultationNotes: '',
    recommendedTests: [],
    labReports: [],
    labAnalysis: '',
    followUpDate: '',
    isFollowUp: false,
    originalPrescriptionId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => {
    if (profile) {
      setData(prev => ({
        ...prev,
        doctorName: profile.full_name || '',
      }));
    }
  }, [profile]);

  const analyzeLabReports = async (files: File[]): Promise<string> => {
    if (files.length === 0) return '';

    try {
      const analysisPromises = files.map(async (file) => {
        const base64 = await fileToBase64(file);
        
        const { data: result, error } = await supabase.functions.invoke('analyze-lab-report', {
          body: {
            image: base64,
            mimeType: file.type
          }
        });

        if (error) throw new Error('Failed to analyze lab report');
        
        return `${file.name}: ${result.analysis}`;
      });

      const analyses = await Promise.all(analysisPromises);
      return analyses.join('\n\n');
    } catch (error) {
      console.error('Error analyzing lab reports:', error);
      toast({
        title: "Lab Analysis Error",
        description: "Failed to analyze lab reports. Please try again.",
        variant: "destructive"
      });
      return 'Error analyzing lab reports';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const extractInfoFromConsultationNotes = (notes: string) => {
    const extractedData = { ...data };
    
    if (notes.toLowerCase().includes('diagnosis:')) {
      const diagnosisMatch = notes.match(/diagnosis:\s*([^\n\r.]+)/i);
      if (diagnosisMatch) {
        extractedData.diagnosis = diagnosisMatch[1].trim();
      }
    }

    if (notes.toLowerCase().includes('symptoms:') || notes.toLowerCase().includes('complaint:')) {
      const symptomsMatch = notes.match(/(symptoms|complaint):\s*([^\n\r.]+)/i);
      if (symptomsMatch) {
        extractedData.notes = extractedData.notes + '\nSymptoms: ' + symptomsMatch[2].trim();
      }
    }

    const testKeywords = ['blood test', 'x-ray', 'mri', 'ct scan', 'ultrasound', 'ecg', 'cbc', 'lipid profile'];
    testKeywords.forEach(keyword => {
      if (notes.toLowerCase().includes(keyword) && !extractedData.recommendedTests.includes(keyword)) {
        extractedData.recommendedTests.push(keyword.toUpperCase());
      }
    });

    return extractedData;
  };

  const handleConsultationNotesChange = (newData: PrescriptionData) => {
    if (newData.consultationNotes !== data.consultationNotes) {
      const extractedData = extractInfoFromConsultationNotes(newData.consultationNotes);
      setData(extractedData);
    } else {
      setData(newData);
    }
  };

  const handleLabReportsChange = async (newData: PrescriptionData) => {
    setData(newData);
    
    if (newData.labReports.length > 0 && newData.labReports.length !== data.labReports.length) {
      const analysis = await analyzeLabReports(newData.labReports);
      setData(prev => ({ ...prev, labAnalysis: analysis }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save prescriptions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!data.patientName?.trim() || !data.doctorName?.trim()) {
        toast({
          title: "Missing Information",
          description: "Patient name and doctor name are required",
          variant: "destructive"
        });
        return;
      }

      if (data.medications.every(med => !med.name.trim())) {
        toast({
          title: "Missing Medications",
          description: "At least one medication is required",
          variant: "destructive"
        });
        return;
      }

      const prescriptionData = {
        ...data,
        medications: data.medications.filter(med => med.name.trim() !== ''),
        doctorName: profile.full_name || data.doctorName
      };

      console.log('Saving prescription data:', prescriptionData);
      
      await savePrescription(prescriptionData);
      
      toast({
        title: "Success",
        description: "Prescription saved successfully!",
      });

      // Reset form
      setData({
        doctorName: profile.full_name || '',
        patientName: '',
        age: 0,
        gender: '',
        contact: '',
        temperature: null,
        bp: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        diagnosis: '',
        notes: '',
        consultationNotes: '',
        recommendedTests: [],
        labReports: [],
        labAnalysis: '',
        followUpDate: '',
        isFollowUp: false,
        originalPrescriptionId: ''
      });
      
      setShowAIAnalysis(false);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultationComplete = (consultationData: any) => {
    console.log('Consultation data received:', consultationData);
    
    setData(prev => ({
      ...prev,
      consultationNotes: consultationData.transcript || '',
      diagnosis: consultationData.diagnosis || prev.diagnosis,
      notes: consultationData.summary || prev.notes
    }));
    
    const extractedData = extractInfoFromConsultationNotes(consultationData.transcript || '');
    setData(prev => ({ ...prev, ...extractedData }));

    toast({
      title: "Voice Consultation Complete",
      description: "Consultation has been processed and form updated",
    });
  };

  const handleAIAnalysisComplete = async (analysis: any) => {
    try {
      console.log('AI Analysis completed:', analysis);
      toast({
        title: "AI Analysis Complete",
        description: "Prescription analysis has been completed",
      });
    } catch (error) {
      console.error('Error saving AI analysis:', error);
      toast({
        title: "Analysis Save Error",
        description: "Failed to save AI analysis",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Prescription System
          </h1>
          <p className="text-gray-600 text-lg">
            Create comprehensive prescriptions with AI assistance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Prescription Form - This handles patient selection */}
          <EnhancedPrescriptionForm data={data} onChange={setData}>
            {/* Voice Recording */}
            <ConsultationRecorder 
              onConsultationComplete={handleConsultationComplete}
              patientId={undefined}
            />
            
            {/* Consultation Notes */}
            <ConsultationNotesSection 
              data={data} 
              onChange={handleConsultationNotesChange} 
            />
            
            {/* Vital Signs */}
            <VitalSigns data={data} onChange={setData} />
            
            {/* Medications */}
            <EnhancedMedicationList data={data} onChange={setData} />
            
            {/* Recommended Tests */}
            <RecommendedTestsSection data={data} onChange={setData} />
            
            {/* Lab Reports */}
            <LabReportsSection data={data} onChange={handleLabReportsChange} />
            
            {/* Follow-up Information */}
            <FollowUpSection data={data} onChange={setData} />

            {/* AI Analysis */}
            {showAIAnalysis && (
              <AIAnalysisSection 
                prescriptionData={data}
                onAnalysisComplete={handleAIAnalysisComplete}
              />
            )}

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                className="flex-1 bg-white/60 backdrop-blur-sm"
                disabled={isSubmitting}
              >
                {showAIAnalysis ? 'Hide' : 'Show'} AI Analysis
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? 'Saving...' : 'Save Prescription'}
              </Button>
            </div>
          </EnhancedPrescriptionForm>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
