
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Trash2, CheckCircle } from 'lucide-react';
import MedicineResolver from './MedicineResolver';
import { PrescriptionData } from './PrescriptionForm';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-green-600" />
          <span>Medications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {medicationsWithResolutions.map((medication, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Medication {index + 1}</span>
              {medicationsWithResolutions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter medicine name (brand or generic)"
                    required
                  />
                  {medication.resolution && medication.resolution.confidence >= 0.7 && (
                    <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-600" />
                  )}
                </div>
                
                <MedicineResolver
                  medicineName={medication.name}
                  onResolutionChange={(resolution) => updateMedication(index, 'resolution', resolution)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Medication
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedMedicationList;
