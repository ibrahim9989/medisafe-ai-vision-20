
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
  const handleTranscriptionComplete = (transcript: string, analysis: any) => {
    console.log('📋 Transcription completed:', { transcript, analysis });
    
    // Auto-fill consultation notes with transcript
    const updatedData = {
      ...data,
      consultationNotes: transcript
    };

    // If we have structured analysis, auto-fill other fields
    if (analysis) {
      if (analysis.diagnosis) {
        updatedData.diagnosis = analysis.diagnosis;
      }

      if (analysis.medications && analysis.medications.length > 0) {
        updatedData.medications = analysis.medications.map((med: any) => ({
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || ''
        }));
      }

      if (analysis.recommendedTests && analysis.recommendedTests.length > 0) {
        updatedData.recommendedTests = analysis.recommendedTests;
      }

      if (analysis.vitalSigns) {
        if (analysis.vitalSigns.temperature) {
          updatedData.temperature = parseFloat(analysis.vitalSigns.temperature) || null;
        }
        if (analysis.vitalSigns.bloodPressure) {
          updatedData.bp = analysis.vitalSigns.bloodPressure;
        }
      }

      if (analysis.followUpInstructions) {
        updatedData.notes = analysis.followUpInstructions;
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
            placeholder="Enter detailed consultation notes, symptoms, examination findings, patient history... Or use voice recording above."
            className="min-h-32 bg-white/60 border-white/30"
          />
          <p className="text-xs text-gray-500 mt-1">
            🎤 Use voice recording to automatically transcribe and analyze consultation notes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationNotesSection;
