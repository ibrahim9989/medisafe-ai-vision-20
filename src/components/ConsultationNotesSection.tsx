
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';
import VoiceRecorder from './VoiceRecorder';

interface ConsultationNotesSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const ConsultationNotesSection = ({ data, onChange }: ConsultationNotesSectionProps) => {
  const handleTranscriptionComplete = (transcriptionData: {
    transcription: string;
    analysis: any;
  }) => {
    console.log('🎯 Processing transcription data:', transcriptionData);
    
    // Update consultation notes with the transcription
    const updatedData = {
      ...data,
      consultationNotes: data.consultationNotes ? 
        `${data.consultationNotes}\n\n[Voice Transcription]\n${transcriptionData.transcription}` : 
        transcriptionData.transcription
    };

    // Auto-fill prescription fields based on analysis
    if (transcriptionData.analysis) {
      const analysis = transcriptionData.analysis;
      
      // Update diagnosis if available
      if (analysis.diagnosis) {
        updatedData.diagnosis = analysis.diagnosis;
      }
      
      // Update vital signs if available
      if (analysis.vitalSigns) {
        if (analysis.vitalSigns.temperature) {
          updatedData.temperature = parseFloat(analysis.vitalSigns.temperature) || updatedData.temperature;
        }
        if (analysis.vitalSigns.bloodPressure) {
          updatedData.bp = analysis.vitalSigns.bloodPressure;
        }
      }
      
      // Update medications if available
      if (analysis.medications && analysis.medications.length > 0) {
        const validMedications = analysis.medications.filter((med: any) => med.name);
        if (validMedications.length > 0) {
          updatedData.medications = validMedications.map((med: any) => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || ''
          }));
        }
      }
      
      // Update recommended tests if available
      if (analysis.recommendedTests && analysis.recommendedTests.length > 0) {
        updatedData.recommendedTests = [...new Set([...updatedData.recommendedTests, ...analysis.recommendedTests])];
      }
      
      // Update notes with symptoms and follow-up instructions
      let additionalNotes = '';
      if (analysis.symptoms) {
        additionalNotes += `\nSymptoms: ${analysis.symptoms}`;
      }
      if (analysis.followUpInstructions) {
        additionalNotes += `\nFollow-up: ${analysis.followUpInstructions}`;
      }
      if (additionalNotes) {
        updatedData.notes = updatedData.notes ? `${updatedData.notes}${additionalNotes}` : additionalNotes.trim();
      }
    }
    
    onChange(updatedData);
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Consultation Notes</span>
          </div>
          <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Consultation Notes
          </label>
          <Textarea
            value={data.consultationNotes}
            onChange={(e) => onChange({ ...data, consultationNotes: e.target.value })}
            placeholder="Enter detailed consultation notes, symptoms, examination findings, patient history... Or use voice recording for automatic transcription and analysis."
            className="min-h-32 bg-white/60 border-white/30"
          />
          <p className="text-xs text-gray-500 mt-1">
            🎤 Use voice recording for automatic transcription and intelligent analysis. AI will extract and auto-fill prescription details from your spoken consultation notes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationNotesSection;
