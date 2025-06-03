
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck } from 'lucide-react';
import { PrescriptionData } from './PrescriptionForm';

interface PatientInfoProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const PatientInfo = ({ data, onChange }: PatientInfoProps) => {
  const handleChange = (field: keyof PrescriptionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>Patient Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor Name *
          </label>
          <input
            type="text"
            value={data.doctorName}
            onChange={(e) => handleChange('doctorName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dr. John Smith"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name *
          </label>
          <input
            type="text"
            value={data.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age *
            </label>
            <input
              type="number"
              value={data.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="35"
              min="0"
              max="120"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              value={data.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Information
          </label>
          <input
            type="text"
            value={data.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Phone number or email"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfo;
