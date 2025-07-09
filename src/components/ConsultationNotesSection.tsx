
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface ConsultationNotesSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const ConsultationNotesSection = ({ data, onChange }: ConsultationNotesSectionProps) => {
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Consultation Notes
          </label>
          <Textarea
            value={data.consultationNotes}
            onChange={(e) => onChange({ ...data, consultationNotes: e.target.value })}
            placeholder="Enter detailed consultation notes, symptoms, examination findings, patient history..."
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
