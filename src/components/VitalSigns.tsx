
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Thermometer } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';

interface VitalSignsProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const VitalSigns = ({ data, onChange }: VitalSignsProps) => {
  const handleChange = (field: keyof PrescriptionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 97) return { status: 'Low', color: 'text-blue-600' };
    if (temp >= 97 && temp <= 99.5) return { status: 'Normal', color: 'text-green-600' };
    if (temp > 99.5 && temp <= 101) return { status: 'Elevated', color: 'text-yellow-600' };
    return { status: 'High', color: 'text-red-600' };
  };

  const tempStatus = getTemperatureStatus(data.temperature);

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl opacity-20 blur-lg"></div>
            <div className="relative p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Vital Signs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Temperature (°F)
          </label>
          <div className="relative">
            <div className="absolute left-3 lg:left-4 top-3 lg:top-4">
              <Thermometer className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={data.temperature || ''}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || 98.6)}
              className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-3 lg:py-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
              placeholder="98.6"
              step="0.1"
              min="90"
              max="110"
            />
          </div>
          <div className={`text-sm lg:text-base mt-2 font-medium ${tempStatus.color}`}>
            Status: {tempStatus.status}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Blood Pressure
          </label>
          <input
            type="text"
            value={data.bp}
            onChange={(e) => handleChange('bp', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
            placeholder="120/80"
            pattern="[0-9]+/[0-9]+"
          />
          <div className="text-xs lg:text-sm text-gray-500 mt-2">
            Format: Systolic/Diastolic (e.g., 120/80)
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-900 mb-3 text-sm lg:text-base">Quick Reference</h4>
          <div className="text-xs lg:text-sm text-blue-800 space-y-2">
            <div>Normal Temperature: 97-99.5°F</div>
            <div>Normal BP: 90/60 - 120/80 mmHg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSigns;
