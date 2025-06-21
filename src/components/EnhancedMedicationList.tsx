
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Trash2, CheckCircle } from 'lucide-react';
import MedicineResolver from './MedicineResolver';
import { PrescriptionData } from '@/types/prescription';
import { MedicineResolution } from '../services/tavilyService';

interface EnhancedMedicationListProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

interface MedicationWithResolution {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  resolution?: MedicineResolution | null;
}

const EnhancedMedicationList = ({ data, onChange }: EnhancedMedicationListProps) => {
  const [medicationsWithResolutions, setMedicationsWithResolutions] = useState<MedicationWithResolution[]>(
    data.medications.map(med => ({ ...med, resolution: null }))
  );

  // Sync internal state when data.medications changes (e.g., from voice commands)
  useEffect(() => {
    console.log('EnhancedMedicationList: data.medications changed:', data.medications);
    
    // Only update if the medication data has actually changed
    const currentMedNames = medicationsWithResolutions.map(med => med.name).join('|');
    const newMedNames = data.medications.map(med => med.name).join('|');
    
    if (currentMedNames !== newMedNames) {
      console.log('EnhancedMedicationList: Syncing medications from voice command');
      const updatedMedications = data.medications.map((med, index) => ({
        ...med,
        resolution: medicationsWithResolutions[index]?.resolution || null
      }));
      setMedicationsWithResolutions(updatedMedications);
    }
  }, [data.medications]);

  const updateMedication = (index: number, field: keyof MedicationWithResolution, value: any) => {
    const updatedMedications = [...medicationsWithResolutions];
    if (field === 'resolution') {
      updatedMedications[index].resolution = value;
    } else {
      updatedMedications[index][field] = value as string;
    }
    setMedicationsWithResolutions(updatedMedications);

    // Update parent data
    const basicMedications = updatedMedications.map(({ resolution, ...med }) => med);
    onChange({
      ...data,
      medications: basicMedications
    });
  };

  const addMedication = () => {
    const newMedications = [...medicationsWithResolutions, { 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '',
      resolution: null
    }];
    setMedicationsWithResolutions(newMedications);
    
    const basicMedications = newMedications.map(({ resolution, ...med }) => med);
    onChange({
      ...data,
      medications: basicMedications
    });
  };

  const removeMedication = (index: number) => {
    const updatedMedications = medicationsWithResolutions.filter((_, i) => i !== index);
    setMedicationsWithResolutions(updatedMedications);
    
    const basicMedications = updatedMedications.map(({ resolution, ...med }) => med);
    onChange({
      ...data,
      medications: basicMedications
    });
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl opacity-20 blur-lg"></div>
            <div className="relative p-2 lg:p-3 bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] rounded-xl shadow-lg">
              <Pill className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Medications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
        {medicationsWithResolutions.map((medication, index) => (
          <div key={index} className="p-4 lg:p-6 border border-white/30 bg-white/30 backdrop-blur-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 text-sm lg:text-base">Medication {index + 1}</span>
              {medicationsWithResolutions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white/60 backdrop-blur-sm min-h-[44px] px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
                    placeholder="Enter medicine name (brand or generic)"
                    required
                  />
                  {medication.resolution && medication.resolution.confidence >= 0.7 && (
                    <CheckCircle className="absolute right-3 lg:right-4 top-3 lg:top-4 h-5 w-5 text-green-600" />
                  )}
                </div>
                
                <MedicineResolver
                  medicineName={medication.name}
                  onResolutionChange={(resolution) => updateMedication(index, 'resolution', resolution)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 shadow-inner ring-1 ring-white/30 text-base"
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="Every 12 hours">Every 12 hours</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  className="w-full p-3 lg:p-4 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#cb6ce6]/30 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner ring-1 ring-white/30 text-base"
                  placeholder="e.g., 7 days, 2 weeks"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addMedication}
          className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-[#cb6ce6] hover:text-[#cb6ce6] bg-white/40 backdrop-blur-sm min-h-[48px] lg:min-h-[56px] text-base rounded-xl"
        >
          <Plus className="h-5 w-5 mr-3" />
          Add Another Medication
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedMedicationList;
