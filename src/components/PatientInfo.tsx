
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
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
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl opacity-20 blur-lg"></div>
            <div className="relative p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Patient Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Doctor Name *
          </label>
          <input
            type="text"
            value={data.doctorName}
            onChange={(e) => handleChange('doctorName', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
            placeholder="Dr. John Smith"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <input
            type="text"
            value={data.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={data.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
              placeholder="35"
              min="0"
              max="120"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={data.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 shadow-inner ring-1 ring-white/30 text-base"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
            Contact Information
          </label>
          <input
            type="text"
            value={data.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
            placeholder="Phone number or email"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfo;
