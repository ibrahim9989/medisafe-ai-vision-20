
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface DiagnosisSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const DiagnosisSection = ({ data, onChange }: DiagnosisSectionProps) => {
  const handleChange = (field: keyof PrescriptionData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl opacity-20 blur-lg"></div>
            <div className="relative p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Stethoscope className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Diagnosis & Medical History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Primary Diagnosis *
          </label>
          <input
            type="text"
            value={data.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
            placeholder="Enter primary diagnosis (e.g., Hypertension, Diabetes Type 2)"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Diagnosis Details
          </label>
          <textarea
            value={data.diagnosisDetails}
            onChange={(e) => handleChange('diagnosisDetails', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base resize-none"
            placeholder="Detailed diagnosis information, severity, stage, additional findings..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Underlying Conditions
          </label>
          <textarea
            value={data.underlyingConditions}
            onChange={(e) => handleChange('underlyingConditions', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base resize-none"
            placeholder="Pre-existing medical conditions, chronic illnesses, allergies, family history..."
            rows={3}
          />
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-purple-100">
          <h4 className="font-medium text-purple-900 mb-3 text-sm lg:text-base">Medical History Guidelines</h4>
          <div className="text-xs lg:text-sm text-purple-800 space-y-2">
            <div>• Include relevant past medical history</div>
            <div>• Note any known allergies or adverse reactions</div>
            <div>• Mention current medications or treatments</div>
            <div>• Include family history if relevant</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosisSection;
