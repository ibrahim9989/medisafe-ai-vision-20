
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
  const handleTranscriptionComplete = (transcription: string, analysis?: any) => {
    // Update consultation notes with transcription
    const updatedData = {
      ...data,
      consultationNotes: data.consultationNotes ? 
        `${data.consultationNotes}\n\n--- Voice Recording ---\n${transcription}` : 
        transcription
    };

    // If analysis is available, auto-fill prescription fields
    if (analysis && !analysis.error) {
      if (analysis.diagnosis && !data.diagnosis) {
        updatedData.diagnosis = analysis.diagnosis;
      }
      
      if (analysis.symptoms && analysis.symptoms.length > 0 && !data.notes) {
        updatedData.notes = `Symptoms: ${analysis.symptoms.join(', ')}`;
      }

      if (analysis.medications && analysis.medications.length > 0) {
        // Only add medications if current list is empty or has only empty entries
        const hasEmptyMedications = data.medications.every(med => !med.name.trim());
        if (hasEmptyMedications) {
          updatedData.medications = analysis.medications.map((med: any) => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || ''
          }));
        }
      }

      if (analysis.vitalSigns) {
        if (analysis.vitalSigns.temperature && !data.temperature) {
          updatedData.temperature = analysis.vitalSigns.temperature;
        }
        if (analysis.vitalSigns.bp && !data.bp) {
          updatedData.bp = analysis.vitalSigns.bp;
        }
      }

      if (analysis.recommendedTests && analysis.recommendedTests.length > 0) {
        const newTests = analysis.recommendedTests.filter((test: string) => 
          !data.recommendedTests.includes(test)
        );
        updatedData.recommendedTests = [...data.recommendedTests, ...newTests];
      }

      if (analysis.followUpInstructions && !data.followUpDate) {
        // Try to extract date from follow-up instructions
        const dateMatch = analysis.followUpInstructions.match(/(\d{1,2})\s+(days?|weeks?|months?)/i);
        if (dateMatch) {
          const num = parseInt(dateMatch[1]);
          const unit = dateMatch[2].toLowerCase();
          const futureDate = new Date();
          
          if (unit.includes('day')) {
            futureDate.setDate(futureDate.getDate() + num);
          } else if (unit.includes('week')) {
            futureDate.setDate(futureDate.getDate() + (num * 7));
          } else if (unit.includes('month')) {
            futureDate.setMonth(futureDate.getMonth() + num);
          }
          
          updatedData.followUpDate = futureDate.toISOString().split('T')[0];
        }
      }
    }

    onChange(updatedData);
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">Consultation Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <VoiceRecorder 
          onTranscriptionComplete={handleTranscriptionComplete}
          existingTranscript={data.consultationNotes}
        />
        
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
            AI will automatically extract relevant information for other fields from these notes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationNotesSection;
