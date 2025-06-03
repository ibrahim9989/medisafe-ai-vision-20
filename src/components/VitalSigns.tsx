
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <span>Vital Signs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature (°F)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3">
              <Thermometer className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={data.temperature || ''}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || 98.6)}
              className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="98.6"
              step="0.1"
              min="90"
              max="110"
            />
          </div>
          <div className={`text-sm mt-1 ${tempStatus.color}`}>
            Status: {tempStatus.status}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Pressure
          </label>
          <input
            type="text"
            value={data.bp}
            onChange={(e) => handleChange('bp', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="120/80"
            pattern="[0-9]+/[0-9]+"
          />
          <div className="text-sm text-gray-500 mt-1">
            Format: Systolic/Diastolic (e.g., 120/80)
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Quick Reference</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Normal Temperature: 97-99.5°F</div>
            <div>Normal BP: 90/60 - 120/80 mmHg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSigns;
